import type {
  InterviewBankFile,
  InterviewEvidenceFile,
  KnowledgeFrontMatter,
  MarkdownDocument,
  QuestionEvidenceView,
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

export const interviewBank = loadYaml<InterviewBankFile>(
  'content/interviews/first-interview-bank-30-v0.3.8.yaml',
)

export const knowledgeArticles = listMarkdownAssets('content/knowledge/')
  .map((asset) =>
    parseFrontMatter<KnowledgeFrontMatter>(asset.path, asset.raw),
  )
  .filter((document) => document.meta.type === 'knowledge')

const evidenceRecords = listYamlAssets(
  'content/interview-evidence/final-review/',
)
  .map((asset) => parseYaml<InterviewEvidenceFile>(asset.raw))
  .filter((record) => record?.type === 'interview_evidence')

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

export function getQuestionEvidence(questionId: string): QuestionEvidenceView[] {
  const seen = new Set<string>()
  const results: QuestionEvidenceView[] = []

  for (const evidence of evidenceRecords) {
    const mapping = evidence.question_evidence?.find(
      (item) => item.canonical_question_id === questionId,
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

export const appRegistry = {
  product: {
    name: 'DataRoadmap',
    subtitle: 'From Data Engineering to AI',
  },
  taxonomy,
  interviewBank,
  knowledgeArticles,
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
