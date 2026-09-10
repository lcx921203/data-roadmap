import { loadYaml } from './loaders'

export interface CuratedFollowUpItem {
  question: string
  answer: string
  kind?: 'curated_extension' | 'evidence_backed'
  canonical_question_id?: string
}

interface CuratedFollowUpQuestion {
  id: string
  items: CuratedFollowUpItem[]
}

interface CuratedFollowUpRegistry {
  version: string
  as_of: string
  type: 'curated_followup_registry'
  questions: CuratedFollowUpQuestion[]
}

const registry = loadYaml<CuratedFollowUpRegistry>(
  'content/interviews/followups/curated-followups-v1.yaml',
)

const byQuestionId = new Map(
  registry.questions.map((question) => [question.id, question.items]),
)

export function getCuratedFollowUps(
  questionId: string,
): CuratedFollowUpItem[] {
  return byQuestionId.get(questionId) ?? []
}
