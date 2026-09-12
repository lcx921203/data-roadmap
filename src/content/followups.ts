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

const registries = [
  loadYaml<CuratedFollowUpRegistry>(
    'content/interviews/followups/curated-followups-v1.yaml',
  ),
  loadYaml<CuratedFollowUpRegistry>(
    'content/interviews/followups/iceberg-followups-v1.1.yaml',
  ),
]

const byQuestionId = new Map<string, CuratedFollowUpItem[]>()

for (const registry of registries) {
  for (const question of registry.questions) {
    const existing = byQuestionId.get(question.id) ?? []
    byQuestionId.set(question.id, [...existing, ...question.items])
  }
}

export function getCuratedFollowUps(
  questionId: string,
): CuratedFollowUpItem[] {
  return byQuestionId.get(questionId) ?? []
}
