const frequencyLabels: Record<string, string> = {
  core_verified: 'CORE VERIFIED',
  repeated_verified: 'REPEATED',
  supported_cross_company: 'CROSS-COMPANY',
  supported_single_company: 'SINGLE-COMPANY',
  single_verified: 'SINGLE VERIFIED',
  unverified_candidate: 'CANDIDATE',
}

export function formatFrequencyBand(value: string): string {
  return frequencyLabels[value] ?? value.replaceAll('_', ' ').toUpperCase()
}
