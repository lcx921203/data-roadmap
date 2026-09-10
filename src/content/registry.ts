import type { InterviewBankFile, TaxonomyFile } from '../types/content'
import { loadYaml } from './loaders'

export const taxonomy = loadYaml<TaxonomyFile>('content/taxonomy.yaml')

export const interviewBank = loadYaml<InterviewBankFile>(
  'content/interviews/first-interview-bank-30-v0.3.8.yaml',
)

export const appRegistry = {
  product: {
    name: 'DataRoadmap',
    subtitle: 'From Data Engineering to AI',
  },
  taxonomy,
  interviewBank,
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
