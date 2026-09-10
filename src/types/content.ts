export type RouteKey = 'learn' | 'interview' | 'scale' | 'projects'
export type ReadingMode = 'interview' | 'learn'

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

export interface InterviewEvidenceMapping {
  canonical_question_id: string
  mapping: string
  summary?: string
}

export interface InterviewEvidenceFile {
  id: string
  type: 'interview_evidence'
  source?: {
    url?: string | null
    source_type?: string | null
    publisher?: string | null
    published_at?: string | null
    captured_at?: string | null
    reliability?: string | null
  }
  interview_context?: {
    company?: string | null
    role?: string | null
    round?: string | null
  }
  independence_group?: string | null
  question_evidence?: InterviewEvidenceMapping[]
  review?: {
    extraction_status?: string | null
    human_verified?: boolean | null
    notes?: string | null
  }
}

export interface QuestionEvidenceView {
  evidence: InterviewEvidenceFile
  mapping: InterviewEvidenceMapping
}

export interface KnowledgeFrontMatter {
  id: string
  type: 'knowledge'
  title: string
  title_cn?: string
  stage_id: string
  domain?: string
  topic?: string
  order?: number
  learning_depth?: string
  stack_role?: string
  difficulty?: string
  content_status?: string
  summary?: string
  prerequisites?: string[]
  related?: string[]
  project_relevance?: string[]
  interview_relevance?: string[]
  scale_scenarios?: string[]
  project_fact_status?: string
}


export interface ScaleScenario {
  id: string
  type: 'scenario'
  order?: number
  title: string
  title_cn?: string
  summary?: string
  domain?: string
  difficulty?: string
  hypothetical: boolean
  scale_dimensions?: string[]
  display_tags?: string[]
  knowledge?: string[]
  projects?: string[]
  interviews?: string[]
  status?: string
}

export interface InterviewAnswerFrontMatter {
  id: string
  type: 'interview'
  question?: string
  domain?: string
  learning_depth?: string
  status?: string
  verification?: {
    answer_curated?: boolean
    publishable?: boolean
    content_review_status?: string
  }
  project_connection?: {
    status?: string
  }
}

/**
 * Front matter is structurally typed.
 *
 * Do not require Record<string, unknown> here: ordinary interfaces such as
 * KnowledgeFrontMatter intentionally do not declare a string index signature.
 */
export interface MarkdownDocument<TMeta extends object = Record<string, unknown>> {
  path: string
  raw: string
  meta: TMeta
  body: string
  title: string | null
}

export interface MarkdownSection {
  title: string
  body: string
}

export interface HashRoute {
  key: RouteKey
  segments: string[]
  path: string
}
