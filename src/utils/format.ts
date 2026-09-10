const frequencyLabels: Record<string, string> = {
  core_verified: 'CORE VERIFIED',
  repeated_verified: 'REPEATED',
  supported_cross_company: 'CROSS-COMPANY',
  supported_single_company: 'SINGLE-COMPANY',
  single_verified: 'SINGLE VERIFIED',
  unverified_candidate: 'CANDIDATE',
}

const mappingLabels: Record<string, string> = {
  direct_question: 'Direct question',
  direct_followup: 'Direct follow-up',
  round_topic: 'Round topic',
  editorial_inference: 'Editorial inference',
}

export function formatFrequencyBand(value: string): string {
  return frequencyLabels[value] ?? value.replaceAll('_', ' ').toUpperCase()
}

export function formatMapping(value: string): string {
  return mappingLabels[value] ?? value.replaceAll('_', ' ')
}
