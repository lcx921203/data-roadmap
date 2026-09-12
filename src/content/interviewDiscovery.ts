import type { InterviewQuestionSummary } from '../types/content'
import type {
  InterviewAnswerFilter,
  InterviewDiscoveryEntry,
  InterviewDiscoveryIndex,
  InterviewFrequencyFilter,
} from '../types/discovery'
import { getCuratedFollowUps } from './followups'
import { loadYaml } from './loaders'

export const interviewDiscovery = loadYaml<InterviewDiscoveryIndex>(
  'content/interviews/interview-discovery-index-v0.6.0.3.yaml',
)

const byId = new Map<string, InterviewDiscoveryEntry>(
  interviewDiscovery.questions.map((entry) => [entry.id, entry]),
)

export function getInterviewDiscoveryEntry(
  id: string,
): InterviewDiscoveryEntry | null {
  return byId.get(id) ?? null
}

function normalized(value: string): string {
  return value.trim().toLocaleLowerCase()
}

export function getMatchingCuratedFollowUp(
  questionId: string,
  rawQuery: string,
): string | null {
  const query = normalized(rawQuery)
  if (!query) return null

  return (
    getCuratedFollowUps(questionId).find((item) =>
      item.question.toLocaleLowerCase().includes(query),
    )?.question ?? null
  )
}

export function matchesInterviewSearch(
  question: InterviewQuestionSummary,
  rawQuery: string,
): boolean {
  const query = normalized(rawQuery)
  if (!query) return true

  const entry = getInterviewDiscoveryEntry(question.id)
  const canonicalHaystack = [
    question.question,
    ...(entry?.search_terms ?? []),
  ]
    .join(' ')
    .toLocaleLowerCase()

  if (canonicalHaystack.includes(query)) return true

  return getMatchingCuratedFollowUp(question.id, query) !== null
}

export function matchesInterviewTag(
  question: InterviewQuestionSummary,
  tag: string | null,
): boolean {
  if (!tag) return true
  return getInterviewDiscoveryEntry(question.id)?.tags.includes(tag) ?? false
}

export function matchesFrequencyFilter(
  question: InterviewQuestionSummary,
  filter: InterviewFrequencyFilter,
  effectiveBand: string = question.frequency_band,
): boolean {
  if (filter === 'all') return true
  if (filter === 'core') return effectiveBand === 'core_verified'
  if (filter === 'repeated') return effectiveBand === 'repeated_verified'
  if (filter === 'supported') {
    return (
      effectiveBand === 'supported_cross_company' ||
      effectiveBand === 'supported_single_company'
    )
  }
  return effectiveBand === 'single_verified'
}

export function matchesAnswerFilter(
  question: InterviewQuestionSummary,
  filter: InterviewAnswerFilter,
): boolean {
  return filter === 'all' || question.answer_curated
}
