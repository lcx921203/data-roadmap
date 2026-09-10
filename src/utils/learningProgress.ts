const STORAGE_KEY = 'data-roadmap:learning-position:v1'

export interface LearningPositionState {
  lastKnowledgeId: string | null
  visitedKnowledgeIds: string[]
  updatedAt: string | null
}

const emptyState: LearningPositionState = {
  lastKnowledgeId: null,
  visitedKnowledgeIds: [],
  updatedAt: null,
}

export function readLearningPosition(): LearningPositionState {
  if (typeof window === 'undefined') return emptyState

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState

    const parsed = JSON.parse(raw) as Partial<LearningPositionState>
    return {
      lastKnowledgeId:
        typeof parsed.lastKnowledgeId === 'string'
          ? parsed.lastKnowledgeId
          : null,
      visitedKnowledgeIds: Array.isArray(parsed.visitedKnowledgeIds)
        ? parsed.visitedKnowledgeIds.filter(
            (value): value is string => typeof value === 'string',
          )
        : [],
      updatedAt:
        typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null,
    }
  } catch {
    return emptyState
  }
}

export function recordKnowledgeVisit(id: string): void {
  if (typeof window === 'undefined') return

  try {
    const current = readLearningPosition()
    const visited = new Set(current.visitedKnowledgeIds)
    visited.add(id)

    const next: LearningPositionState = {
      lastKnowledgeId: id,
      visitedKnowledgeIds: [...visited],
      updatedAt: new Date().toISOString(),
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Local progress is helpful but must never block reading.
  }
}
