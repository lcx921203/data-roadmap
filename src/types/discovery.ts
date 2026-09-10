export interface InterviewDiscoveryTag {
  id: string
  label: string
}

export interface InterviewDiscoveryEntry {
  id: string
  tags: string[]
  search_terms: string[]
}

export interface InterviewDiscoveryIndex {
  version: string
  type: 'interview_discovery_index'
  quick_tags: InterviewDiscoveryTag[]
  questions: InterviewDiscoveryEntry[]
}

export type InterviewFrequencyFilter =
  | 'all'
  | 'core'
  | 'repeated'
  | 'supported'
  | 'single'

export type InterviewAnswerFilter = 'all' | 'curated'
