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

export const taxonomy = loadYaml<TaxonomyFile>('content/taxonomy.yaml')

const firstInterviewBank = loadYaml<InterviewBankFile>(
  'content/interviews/first-interview-bank-30-v0.3.8.yaml',
)

const interviewSupplement = loadYaml<InterviewBankFile>(
  'content/interviews/interview-bank-supplement-v1.yaml',
)

const mergedQuestions = [
  ...firstInterviewBank.questions,
  ...interviewSupplement.questions,
]

export const interviewBank: InterviewBankFile = {
  version: 'current',
  as_of: interviewSupplement.as_of || firstInterviewBank.as_of,
  selection_count: mergedQuestions.length,
  publication_note:
    'Current app registry: frozen First 30 plus future supplement.',
  questions: mergedQuestions,
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

const evidenceRecords = listYamlAssets(
  'content/interview-evidence/final-review/',
)
  .map((asset) => parseYaml<InterviewEvidenceFile>(asset.raw))
  .filter((record) => record?.type === 'interview_evidence')

export interface QuestionEvidenceStats {
  evidenceCount: number
  companyCount: number
  frequencyBand: string
  fromLiveEvidence: boolean
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

function isDirectMapping(mapping: string): boolean {
  return mapping === 'direct_question' || mapping === 'direct_followup'
}

export function getQuestionEvidence(questionId: string): QuestionEvidenceView[] {
  const seen = new Set<string>()
  const results: QuestionEvidenceView[] = []

  for (const evidence of evidenceRecords) {
    const mappings =
      evidence.question_evidence?.filter(
        (item) =>
          item.canonical_question_id === questionId &&
          isDirectMapping(item.mapping),
      ) ?? []

    if (mappings.length === 0) continue

    const dedupeKey = evidence.independence_group || evidence.id
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)

    results.push({ evidence, mapping: mappings[0] })
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
  const directEvidence = getQuestionEvidence(question.id)

  if (directEvidence.length === 0) {
    return {
      evidenceCount: question.direct_count,
      companyCount: question.company_count,
      frequencyBand: question.frequency_band,
      fromLiveEvidence: false,
    }
  }

  const companies = new Set(
    directEvidence
      .map((item) => item.evidence.interview_context?.company)
      .filter((value): value is string => Boolean(value)),
  )

  const evidenceCount = directEvidence.length
  const companyCount = companies.size

  return {
    evidenceCount,
    companyCount,
    frequencyBand: deriveFrequencyBand(
      evidenceCount,
      companyCount,
      question.frequency_band,
    ),
    fromLiveEvidence: true,
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
