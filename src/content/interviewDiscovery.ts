import type { InterviewQuestionSummary } from '../types/content'
import type {
  InterviewAnswerFilter,
  InterviewDiscoveryEntry,
  InterviewDiscoveryIndex,
  InterviewFrequencyFilter,
} from '../types/discovery'
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

export function matchesInterviewSearch(
  question: InterviewQuestionSummary,
  rawQuery: string,
): boolean {
  const query = rawQuery.trim().toLocaleLowerCase()
  if (!query) return true

  const entry = getInterviewDiscoveryEntry(question.id)
  const haystack = [
    question.question,
    ...(entry?.search_terms ?? []),
  ]
    .join(' ')
    .toLocaleLowerCase()

  return haystack.includes(query)
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
): boolean {
  if (filter === 'all') return true
  if (filter === 'core') return question.frequency_band === 'core_verified'
  if (filter === 'repeated') {
    return question.frequency_band === 'repeated_verified'
  }
  if (filter === 'supported') {
    return (
      question.frequency_band === 'supported_cross_company' ||
      question.frequency_band === 'supported_single_company'
    )
  }
  return question.frequency_band === 'single_verified'
}

export function matchesAnswerFilter(
  question: InterviewQuestionSummary,
  filter: InterviewAnswerFilter,
): boolean {
  return filter === 'all' || question.answer_curated
}
