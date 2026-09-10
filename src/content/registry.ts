import type {
  InterviewBankFile,
  InterviewEvidenceFile,
  InterviewQuestionSummary,
  KnowledgeFrontMatter,
  MarkdownDocument,
  QuestionEvidenceView,
  ScaleScenario,
  TaxonomyFile,
} from '../types/content'
import {
  listMarkdownAssets,
  listYamlAssets,
  loadYaml,
  parseFrontMatter,
  parseYaml,
} from './loaders'

interface CanonicalFrequencyRecord {
  id: string
  verified_direct?: {
    independent_count?: number
    company_count?: number
    ids?: string[]
    companies?: string[]
    publishers?: string[]
  }
  frequency?: {
    band?: string
  }
  priority_rank?: number
}

interface CanonicalFrequencyFile {
  version: string
  as_of: string
  questions: CanonicalFrequencyRecord[]
}

export const taxonomy = loadYaml<TaxonomyFile>('content/taxonomy.yaml')

const firstInterviewBank = loadYaml<InterviewBankFile>(
  'content/interviews/first-interview-bank-30-v0.3.8.yaml',
)

const interviewSupplement = loadYaml<InterviewBankFile>(
  'content/interviews/interview-bank-supplement-v1.yaml',
)

const historicalFrequency = loadYaml<CanonicalFrequencyFile>(
  'content/interviews/canonical-frequency-v0.3.8.yaml',
)

const frequencySupplement = loadYaml<CanonicalFrequencyFile>(
  'content/interviews/canonical-frequency-supplement-v1.yaml',
)

const frequencyById = new Map<string, CanonicalFrequencyRecord>()

for (const record of historicalFrequency.questions) {
  frequencyById.set(record.id, record)
}

for (const record of frequencySupplement.questions) {
  frequencyById.set(record.id, record)
}

const rawQuestions = [
  ...firstInterviewBank.questions,
  ...interviewSupplement.questions,
]

const currentQuestions = rawQuestions
  .map((question, sourceIndex) => ({
    question,
    sourceIndex,
    priority:
      frequencyById.get(question.id)?.priority_rank ??
      question.rank ??
      10000 + sourceIndex,
  }))
  .sort(
    (left, right) =>
      left.priority - right.priority ||
      left.sourceIndex - right.sourceIndex,
  )
  .map(({ question }, index) => ({
    ...question,
    rank: index + 1,
  }))

export const interviewBank: InterviewBankFile = {
  version: 'current',
  as_of: frequencySupplement.as_of || historicalFrequency.as_of,
  selection_count: currentQuestions.length,
  publication_note:
    'Current app registry: frozen First 30 plus current supplements.',
  questions: currentQuestions,
}

export const knowledgeArticles = listMarkdownAssets('content/knowledge/')
  .map((asset) =>
    parseFrontMatter<KnowledgeFrontMatter>(asset.path, asset.raw),
  )
  .filter((document) => document.meta.type === 'knowledge')
  .sort((left, right) => {
    const stageCompare = left.meta.stage_id.localeCompare(right.meta.stage_id)
    if (stageCompare !== 0) return stageCompare

    const orderCompare = (left.meta.order ?? 999) - (right.meta.order ?? 999)
    if (orderCompare !== 0) return orderCompare

    return left.meta.title.localeCompare(right.meta.title)
  })

export const scaleScenarios = listYamlAssets('content/scenarios/')
  .map((asset) => parseYaml<ScaleScenario>(asset.raw))
  .filter((scenario) => scenario?.type === 'scenario')
  .sort((left, right) => (left.order ?? 999) - (right.order ?? 999))

function evidencePathPriority(path: string): number {
  if (path.includes('/final-review/')) return 4
  if (path.includes('/non-nowcoder/')) return 3
  if (path.includes('/expanded/')) return 2
  if (path.includes('/seed/')) return 1
  return 0
}

const evidenceById = new Map<
  string,
  { evidence: InterviewEvidenceFile; path: string }
>()

for (const asset of listYamlAssets('content/interview-evidence/')) {
  const parsed = parseYaml<InterviewEvidenceFile>(asset.raw)

  if (parsed?.type !== 'interview_evidence' || !parsed.id) continue

  const current = evidenceById.get(parsed.id)
  if (
    !current ||
    evidencePathPriority(asset.path) >= evidencePathPriority(current.path)
  ) {
    evidenceById.set(parsed.id, {
      evidence: parsed,
      path: asset.path,
    })
  }
}

export interface QuestionEvidenceStats {
  evidenceCount: number
  companyCount: number
  frequencyBand: string
  source: 'canonical-frequency' | 'question-fallback'
}

export function getKnowledgeById(
  id: string,
): MarkdownDocument<KnowledgeFrontMatter> | null {
  return knowledgeArticles.find((article) => article.meta.id === id) ?? null
}

export function getKnowledgeForStage(
  stageId: string,
): MarkdownDocument<KnowledgeFrontMatter>[] {
  return knowledgeArticles.filter((article) => article.meta.stage_id === stageId)
}

export function getKnowledgeNeighbors(id: string): {
  previous: MarkdownDocument<KnowledgeFrontMatter> | null
  next: MarkdownDocument<KnowledgeFrontMatter> | null
} {
  const current = getKnowledgeById(id)
  if (!current) return { previous: null, next: null }

  const stageArticles = getKnowledgeForStage(current.meta.stage_id)
  const index = stageArticles.findIndex((article) => article.meta.id === id)

  return {
    previous: index > 0 ? stageArticles[index - 1] : null,
    next:
      index >= 0 && index < stageArticles.length - 1
        ? stageArticles[index + 1]
        : null,
  }
}

export function getQuestionFrequencyRecord(
  questionId: string,
): CanonicalFrequencyRecord | null {
  return frequencyById.get(questionId) ?? null
}

export function getQuestionEvidence(questionId: string): QuestionEvidenceView[] {
  const frequency = getQuestionFrequencyRecord(questionId)
  const verifiedIds = Array.from(
    new Set(frequency?.verified_direct?.ids ?? []),
  )

  if (verifiedIds.length > 0) {
    return verifiedIds.flatMap((evidenceId) => {
      const candidate = evidenceById.get(evidenceId)
      if (!candidate) return []

      return [
        {
          evidence: candidate.evidence,
          mapping: {
            canonical_question_id: questionId,
            mapping: 'direct_question',
          },
        },
      ]
    })
  }

  // Future fallback: only direct mappings that are explicitly present
  // on an Evidence record count as question-level Evidence.
  const seen = new Set<string>()
  const results: QuestionEvidenceView[] = []

  for (const { evidence } of evidenceById.values()) {
    const mapping = evidence.question_evidence?.find(
      (item) =>
        item.canonical_question_id === questionId &&
        (item.mapping === 'direct_question' ||
          item.mapping === 'direct_followup'),
    )

    if (!mapping) continue

    const dedupeKey = evidence.independence_group || evidence.id
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)

    results.push({ evidence, mapping })
  }

  return results.sort((a, b) => {
    const left = a.evidence.source?.published_at ?? ''
    const right = b.evidence.source?.published_at ?? ''
    return right.localeCompare(left)
  })
}

function deriveFrequencyBand(
  evidenceCount: number,
  companyCount: number,
  fallback: string,
): string {
  if (evidenceCount >= 5 && companyCount >= 3) return 'core_verified'
  if (evidenceCount >= 3 && companyCount >= 2) return 'repeated_verified'
  if (evidenceCount >= 2 && companyCount >= 2) {
    return 'supported_cross_company'
  }
  if (evidenceCount >= 2) return 'supported_single_company'
  if (evidenceCount === 1) return 'single_verified'
  return fallback
}

export function getQuestionEvidenceStats(
  question: InterviewQuestionSummary,
): QuestionEvidenceStats {
  const frequency = getQuestionFrequencyRecord(question.id)

  if (frequency?.verified_direct) {
    const ids = Array.from(new Set(frequency.verified_direct.ids ?? []))
    const declaredCompanies = Array.from(
      new Set(frequency.verified_direct.companies ?? []),
    )

    const evidenceCompanies = Array.from(
      new Set(
        ids
          .map((id) => evidenceById.get(id)?.evidence.interview_context?.company)
          .filter((value): value is string => Boolean(value)),
      ),
    )

    const companyCount =
      declaredCompanies.length > 0
        ? declaredCompanies.length
        : evidenceCompanies.length

    return {
      evidenceCount: ids.length,
      companyCount,
      frequencyBand: deriveFrequencyBand(
        ids.length,
        companyCount,
        frequency.frequency?.band ?? question.frequency_band,
      ),
      source: 'canonical-frequency',
    }
  }

  return {
    evidenceCount: question.direct_count,
    companyCount: question.company_count,
    frequencyBand: question.frequency_band,
    source: 'question-fallback',
  }
}

export const appRegistry = {
  product: {
    name: 'DataRoadmap',
    subtitle: 'From Data Engineering to AI',
  },
  taxonomy,
  interviewBank,
  knowledgeArticles,
  scaleScenarios,
  scaleFamilies: [
    'Streaming',
    'Batch / Spark',
    'Lakehouse',
    'Semantic / Serving',
    'Governance',
    'Agent',
  ],
  projects: [
    {
      id: 'north-america',
      name: 'North America Project',
      status: 'fact-check-required',
    },
    {
      id: 'ahu',
      name: 'Ahu Medical Exam',
      status: 'fact-check-required',
    },
    {
      id: 'caishi',
      name: 'Caishi Live',
      status: 'fact-check-required',
    },
  ],
} as const
