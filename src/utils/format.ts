const frequencyLabels: Record<string, string> = {
  core_verified: '核心重复题',
  repeated_verified: '多次重复题',
  supported_cross_company: '跨公司验证题',
  supported_single_company: '单公司重复题',
  single_verified: '真实单次题',
  unverified_candidate: '待验证',
}

const mappingLabels: Record<string, string> = {
  direct_question: '直接题目',
  direct_followup: '直接追问',
  round_topic: '同轮主题',
  editorial_inference: '关联线索',
}

const sourceReliabilityLabels: Record<string, string> = {
  A: '一手完整记录',
  B: '一手面经',
  C: '可追溯来源',
  D: '待核验来源',
}

export function formatFrequencyBand(value: string): string {
  return frequencyLabels[value] ?? '真实面经题'
}

export function formatMapping(value: string): string {
  return mappingLabels[value] ?? '相关记录'
}

export function formatSourceReliability(value?: string | null): string | null {
  if (!value) return null
  return sourceReliabilityLabels[value] ?? null
}
