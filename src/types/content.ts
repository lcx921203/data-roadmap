export type RouteKey = 'learn' | 'interview' | 'scale' | 'projects'

export interface TaxonomyStage {
  id: string
  slug: string
  title_cn: string
  title_en: string
}

export interface TaxonomyFile {
  version: string
  depths: Record<string, string>
  stages: TaxonomyStage[]
}

export interface InterviewQuestionSummary {
  rank: number
  id: string
  question: string
  frequency_band: string
  direct_count: number
  company_count: number
  answer_curated: boolean
  content_status: string
  publishable: boolean
}

export interface InterviewBankFile {
  version: string
  as_of: string
  selection_count: number
  publication_note?: string
  questions: InterviewQuestionSummary[]
}

export interface MarkdownAsset {
  path: string
  raw: string
}
