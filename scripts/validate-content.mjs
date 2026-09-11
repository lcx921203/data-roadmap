import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

const root = process.cwd()

function readText(relativePath) {
  const fullPath = path.join(root, relativePath)

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Required content file is missing: ${relativePath}`)
  }

  return fs.readFileSync(fullPath, 'utf8')
}

function readYaml(relativePath) {
  return yaml.load(readText(relativePath))
}

function readFrontMatter(relativePath) {
  const raw = readText(relativePath)
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)

  if (!match) {
    throw new Error(`Front Matter missing: ${relativePath}`)
  }

  return {
    meta: yaml.load(match[1]),
    body: match[2],
  }
}

const taxonomy = readYaml('content/taxonomy.yaml')
const interviewBank = readYaml(
  'content/interviews/first-interview-bank-30-v0.3.8.yaml',
)
const components = readYaml('content/design/components-v1.yaml')

const canonicalFrequency = readYaml(
  'content/interviews/canonical-frequency-v0.3.8.yaml',
)
const canonicalFrequencySupplement = readYaml(
  'content/interviews/canonical-frequency-supplement-v1.yaml',
)

if (!Array.isArray(canonicalFrequency?.questions)) {
  throw new Error('Canonical frequency V0.3.8 must contain questions')
}

if (!Array.isArray(canonicalFrequencySupplement?.questions)) {
  throw new Error('Canonical frequency supplement must contain questions')
}

for (const record of canonicalFrequency.questions) {
  const ids = Array.from(new Set(record?.verified_direct?.ids ?? []))
  const companies = Array.from(
    new Set(record?.verified_direct?.companies ?? []),
  )

  if (
    typeof record?.verified_direct?.independent_count === 'number' &&
    record.verified_direct.independent_count !== ids.length
  ) {
    throw new Error(
      `Canonical evidence count mismatch for ${record.id}`,
    )
  }

  if (
    typeof record?.verified_direct?.company_count === 'number' &&
    record.verified_direct.company_count !== companies.length
  ) {
    throw new Error(
      `Canonical company count mismatch for ${record.id}`,
    )
  }
}

if (!Array.isArray(taxonomy?.stages) || taxonomy.stages.length !== 12) {
  throw new Error(
    `Expected 12 taxonomy stages, found ${taxonomy?.stages?.length ?? 'invalid'}`,
  )
}

if (
  interviewBank?.selection_count !== 30 ||
  !Array.isArray(interviewBank?.questions) ||
  interviewBank.questions.length !== 30
) {
  throw new Error(
    'Interview Bank V1 must contain exactly the selected first 30 questions',
  )
}

const interviewSupplement = readYaml(
  'content/interviews/interview-bank-supplement-v1.yaml',
)

if (!Array.isArray(interviewSupplement?.questions)) {
  throw new Error('Interview supplement must contain a questions array')
}

const mergedInterviewIds = new Set()

for (const question of [
  ...interviewBank.questions,
  ...interviewSupplement.questions,
]) {
  if (!question?.id) {
    throw new Error('Merged interview question without stable ID')
  }

  if (mergedInterviewIds.has(question.id)) {
    throw new Error(`Duplicate merged interview question ID: ${question.id}`)
  }

  mergedInterviewIds.add(question.id)
}

if (components?.status !== 'frozen' || components?.version !== '1.6') {
  throw new Error('Design components-v1.yaml must remain frozen at V1.6')
}

const ids = new Set()
let curatedCount = 0

for (const question of interviewBank.questions) {
  if (!question?.id) {
    throw new Error('Interview question without stable ID')
  }

  if (ids.has(question.id)) {
    throw new Error(`Duplicate interview question ID: ${question.id}`)
  }
  ids.add(question.id)

  if (question.answer_curated) {
    curatedCount += 1
    const answerPath = `content/interviews/answers/${question.id}.md`
    const answer = readFrontMatter(answerPath)

    if (answer.meta?.id !== question.id || answer.meta?.type !== 'interview') {
      throw new Error(`Answer Front Matter mismatch: ${answerPath}`)
    }

    if (!/##\s+30 秒回答/.test(answer.body)) {
      throw new Error(`Curated answer missing 30 秒回答: ${answerPath}`)
    }
  }
}

const spine = readYaml('content/knowledge/iceberg-spine-v0.6.0.yaml')

if (
  spine?.version !== '0.6.1' ||
  spine?.topic !== 'iceberg' ||
  !Array.isArray(spine?.nodes) ||
  spine.nodes.length !== 11
) {
  throw new Error('Iceberg V0.6.1 spine must contain exactly 11 ordered nodes')
}

const knowledgeIds = new Set()
const orders = new Set()

for (const node of spine.nodes) {
  const candidates = fs
    .readdirSync(path.join(root, 'content/knowledge'))
    .filter((name) => name.startsWith('kb-') && name.endsWith('.md'))

  let found = null

  for (const name of candidates) {
    const relativePath = `content/knowledge/${name}`
    const document = readFrontMatter(relativePath)
    if (document.meta?.id === node.id) {
      found = { relativePath, ...document }
      break
    }
  }

  if (!found) {
    throw new Error(`Iceberg spine node has no Markdown file: ${node.id}`)
  }

  if (
    found.meta?.type !== 'knowledge' ||
    found.meta?.stage_id !== '04' ||
    found.meta?.topic !== 'iceberg' ||
    found.meta?.learning_depth !== 'L5'
  ) {
    throw new Error(`Invalid Iceberg knowledge metadata: ${node.id}`)
  }

  if (found.meta?.order !== node.order) {
    throw new Error(`Iceberg knowledge order mismatch: ${node.id}`)
  }

  if (!/##\s+30 秒理解/.test(found.body)) {
    throw new Error(`Iceberg knowledge missing 30 秒理解: ${node.id}`)
  }

  if (knowledgeIds.has(node.id)) {
    throw new Error(`Duplicate Iceberg knowledge ID: ${node.id}`)
  }

  if (orders.has(node.order)) {
    throw new Error(`Duplicate Iceberg knowledge order: ${node.order}`)
  }

  knowledgeIds.add(node.id)
  orders.add(node.order)
}


const expectedIcebergSpine = [
  'kb-iceberg-overview-001',
  'kb-iceberg-metadata-snapshot-001',
  'kb-iceberg-manifest-tree-001',
  'kb-iceberg-row-level-changes-001',
  'kb-iceberg-partition-evolution-001',
  'kb-iceberg-schema-evolution-001',
  'kb-iceberg-trino-read-path-001',
  'kb-iceberg-write-distribution-ordering-001',
  'kb-iceberg-commit-concurrency-001',
  'kb-iceberg-maintenance-small-files-001',
  'kb-iceberg-production-troubleshooting-001',
]

for (let index = 0; index < expectedIcebergSpine.length; index += 1) {
  const node = spine.nodes[index]
  if (
    node?.order !== index + 1 ||
    node?.id !== expectedIcebergSpine[index]
  ) {
    throw new Error(
      `Iceberg V0.6.1 spine mismatch at order ${index + 1}`,
    )
  }
}

const manifestV061 = readFrontMatter(
  'content/knowledge/kb-iceberg-manifest-tree-001.md',
)
for (const required of [
  '要么是 Data Manifest，要么是 Delete Manifest',
  '一个 Manifest 只对应一个 Partition Spec',
  'Manifest 写出后就是不可变文件',
]) {
  if (!manifestV061.body.includes(required)) {
    throw new Error(`Manifest P0 correctness rule missing: ${required}`)
  }
}

const rowLevelV061 = readFrontMatter(
  'content/knowledge/kb-iceberg-row-level-changes-001.md',
)
for (const required of [
  'Position Delete',
  'Equality Delete',
  'Deletion Vector',
  'Sequence Number',
  'Data Manifest',
  'Delete Manifest',
]) {
  if (!rowLevelV061.body.includes(required)) {
    throw new Error(`Row-level chapter missing required concept: ${required}`)
  }
}

const maintenanceV061 = readFrontMatter(
  'content/knowledge/kb-iceberg-maintenance-small-files-001.md',
)
for (const required of [
  'commit.manifest.target-size-bytes = 8 MB',
  'commit.manifest.min-count-to-merge = 100',
  'commit.manifest-merge.enabled = true',
  '8 MB 是 Merge Target',
  'rewriteManifests',
]) {
  if (!maintenanceV061.body.includes(required)) {
    throw new Error(`Manifest maintenance rule missing: ${required}`)
  }
}

const scenarioFiles = [
  'sc-iceberg-10b-backfill-001.yaml',
  'sc-iceberg-streaming-small-files-001.yaml',
  'sc-iceberg-concurrent-commit-001.yaml',
]

for (const file of scenarioFiles) {
  const scenario = readYaml(`content/scenarios/${file}`)
  if (scenario?.type !== 'scenario' || scenario?.hypothetical !== true) {
    throw new Error(`Scale scenario must remain explicitly hypothetical: ${file}`)
  }
}



const frontstageFiles = [
  'src/pages/LearnPage.tsx',
  'src/pages/StagePage.tsx',
  'src/pages/KnowledgeDetailPage.tsx',
  'src/pages/InterviewPage.tsx',
  'src/pages/InterviewDetailPage.tsx',
  'src/pages/ScalePage.tsx',
  'src/pages/ProjectsPage.tsx',
  'src/components/QuestionRow.tsx',
  'src/components/EvidenceDisclosure.tsx',
]

const forbiddenFrontstageMarkers = [
  'Publishable',
  'Evidence scope',
  'CURATION BACKLOG',
  'Content backlog',
  'HYPOTHETICAL PRODUCTION TRAINING',
  'FACT BOUNDARY',
  'v0.6.0_spine',
  'needs_fact_check',
  'final-review Evidence',
  '当前 Bundle',
  'Front Matter 驱动',
  '打开原始来源',
  '一手完整记录',
]

for (const file of frontstageFiles) {
  const source = readText(file)
  for (const marker of forbiddenFrontstageMarkers) {
    if (source.includes(marker)) {
      throw new Error(`Internal frontstage marker "${marker}" leaked into ${file}`)
    }
  }
}

const icebergFiles = fs
  .readdirSync(path.join(root, 'content/knowledge'))
  .filter((name) => name.startsWith('kb-iceberg-') && name.endsWith('.md'))

const forbiddenKnowledgeBodyMarkers = [
  'Project Fact Check',
  '当前 V0.6.0',
  '本轮新增',
  '当前 DataRoadmap',
  'needs_fact_check',
]

for (const file of icebergFiles) {
  const document = readFrontMatter(`content/knowledge/${file}`)
  for (const marker of forbiddenKnowledgeBodyMarkers) {
    if (document.body.includes(marker)) {
      throw new Error(
        `Internal editorial marker "${marker}" leaked into visible Knowledge body: ${file}`,
      )
    }
  }
}


const evidenceDisclosureSource = readText(
  'src/components/EvidenceDisclosure.tsx',
)

if (evidenceDisclosureSource.includes('source?.url')) {
  throw new Error(
    'Evidence source URL must remain backstage and must not be rendered in the frontstage Evidence sheet',
  )
}


const dynamicNumberFrontstage = [
  'src/pages/LearnPage.tsx',
  'src/pages/StagePage.tsx',
  'src/pages/InterviewPage.tsx',
  'src/pages/InterviewDetailPage.tsx',
  'src/components/QuestionRow.tsx',
  'src/components/EvidenceDisclosure.tsx',
]

const forbiddenStaticCountLiterals = [
  '42%',
  '30 / 30',
  '12 个阶段',
  '11 份面经',
  '11 条独立面经',
  '5 家公司',
  '7 / 10',
]

for (const file of dynamicNumberFrontstage) {
  const source = readText(file)
  for (const literal of forbiddenStaticCountLiterals) {
    if (source.includes(literal)) {
      throw new Error(
        `Hard-coded dynamic frontstage number "${literal}" found in ${file}`,
      )
    }
  }
}

const evidenceUiSource = readText('src/components/EvidenceDisclosure.tsx')
if (
  evidenceUiSource.includes('question.direct_count') ||
  evidenceUiSource.includes('question.company_count')
) {
  throw new Error(
    'Evidence UI must use current frequency registry, not copied question counts',
  )
}

const questionRowSource = readText('src/components/QuestionRow.tsx')
if (
  questionRowSource.includes('item.direct_count') ||
  questionRowSource.includes('item.company_count')
) {
  throw new Error(
    'QuestionRow must use current evidence stats, not copied question counts',
  )
}

console.log('Frontstage copy audit passed.')


const followUpRegistry = readYaml(
  'content/interviews/followups/curated-followups-v1.yaml',
)

if (
  followUpRegistry?.type !== 'curated_followup_registry' ||
  !Array.isArray(followUpRegistry?.questions)
) {
  throw new Error('Curated follow-up registry is invalid')
}

const curatedMainQuestionIds = new Set(
  interviewBank.questions
    .filter((question) => question.answer_curated)
    .map((question) => question.id),
)

const followUpQuestionIds = new Set(
  followUpRegistry.questions.map((question) => question.id),
)

for (const id of curatedMainQuestionIds) {
  if (!followUpQuestionIds.has(id)) {
    throw new Error(`Curated main question missing follow-up answer set: ${id}`)
  }
}

for (const group of followUpRegistry.questions) {
  const seenQuestions = new Set()
  for (const item of group.items ?? []) {
    if (!item?.question || !item?.answer) {
      throw new Error(`Empty follow-up answer in ${group.id}`)
    }
    if (seenQuestions.has(item.question)) {
      throw new Error(`Duplicate follow-up question in ${group.id}`)
    }
    seenQuestions.add(item.question)
  }
}

const interviewDetailSource = readText('src/pages/InterviewDetailPage.tsx')
if (!interviewDetailSource.includes('ScaleFollowUpSection')) {
  throw new Error('Interview detail must use ScaleFollowUpSection')
}

const scaleRendererSource = readText(
  'src/components/ScaleFollowUpSection.tsx',
)
if (
  scaleRendererSource.includes('<CodeBlock') ||
  scaleRendererSource.includes('Copy')
) {
  throw new Error(
    'Interview scale parameters must not render as CodeBlock/Copy UI',
  )
}

const followUpSource = readText('src/components/FollowUpDisclosure.tsx')
if (!followUpSource.includes('aria-expanded')) {
  throw new Error('Follow-up disclosure must expose aria-expanded')
}

console.log('Interview semantics V0.6.0.7 validation passed.')


const scalePageSource = readText('src/pages/ScalePage.tsx')
if (scalePageSource.includes('<p className="eyebrow">Scale Lab</p>')) {
  throw new Error('Scale page must not repeat the Scale Lab eyebrow')
}
if (!scalePageSource.includes("scenario.display_tags.join(' · ')")) {
  throw new Error('Scale descriptive metadata must use middle-dot grammar')
}

const scaleFollowupV13 = readText('src/components/ScaleFollowUpSection.tsx')
if (scaleFollowupV13.includes('INTERVIEW FOLLOW-UP')) {
  throw new Error('Internal Interview follow-up kicker leaked to frontstage')
}
if (
  scaleFollowupV13.includes("branch[2].trim()") === false ||
  scaleFollowupV13.includes("line.last") === false
) {
  throw new Error('Scale ASCII branch text must be converted to visual hierarchy')
}

const motionCss = readText('src/styles/motion-metadata-v1.3.css')
if (
  !motionCss.includes('.continue-focus-card::before') ||
  !motionCss.includes('continue-border-flow') ||
  !motionCss.includes('prefers-reduced-motion: reduce')
) {
  throw new Error('Continue Learning current-state motion contract is incomplete')
}
if (motionCss.includes('box-shadow:')) {
  throw new Error('Current-state flow highlight must not use box-shadow')
}

const followUpV13 = readText('src/components/FollowUpDisclosure.tsx')
if (!followUpV13.includes("aria-expanded={expanded}")) {
  throw new Error('Follow-up row must remain the accessible disclosure control')
}

console.log('Motion & metadata V0.6.0.7 validation passed.')


const markdownBlocksSource = readText('src/components/MarkdownBlocks.tsx')
if (
  !markdownBlocksSource.includes("language.startsWith('diagram-')") ||
  !markdownBlocksSource.includes('<TechnicalDiagram')
) {
  throw new Error('Markdown renderer must route diagram-* directives')
}

const technicalDiagramSource = readText('src/components/TechnicalDiagram.tsx')
for (const id of ['iceberg-metadata-tree', 'iceberg-manifest-tree']) {
  if (!technicalDiagramSource.includes(id)) {
    throw new Error(`Missing Technical Diagram registry entry: ${id}`)
  }
}

const overviewKnowledge = readText(
  'content/knowledge/kb-iceberg-overview-001.md',
)
if (overviewKnowledge.includes('```diagram-iceberg-metadata-tree')) {
  throw new Error(
    'Iceberg overview should use the concise text relationship chain, not the metadata diagram',
  )
}

const manifestKnowledge = readText(
  'content/knowledge/kb-iceberg-manifest-tree-001.md',
)
if (manifestKnowledge.includes('```diagram-iceberg-manifest-tree')) {
  throw new Error(
    'Manifest knowledge should use the concise text relationship chain, not the manifest diagram',
  )
}
if (
  !manifestKnowledge.includes(
    '1 个 Snapshot → 1 个 Manifest List → N 个 Manifest',
  )
) {
  throw new Error('Manifest knowledge must keep the core quantity relationship')
}

const diagramCss = readText('src/styles/diagram-system-v1.css')
if (
  !diagramCss.includes('.technical-diagram') ||
  !diagramCss.includes('.diagram-branch__children')
) {
  throw new Error('Technical Diagram CSS contract is incomplete')
}

console.log('Technical Diagram capability validation passed.')


const diagramFrameSource = readText(
  'src/components/diagrams/DiagramFrame.tsx',
)
if (diagramFrameSource.includes('<span>结构图</span>')) {
  throw new Error('Diagram header must not repeat a type badge')
}
if (!diagramFrameSource.includes('DiagramBranch')) {
  throw new Error('Directional DiagramBranch primitive is required')
}

const metadataDiagramSource = readText(
  'src/components/diagrams/IcebergMetadataTree.tsx',
)
const manifestDiagramSource = readText(
  'src/components/diagrams/IcebergManifestTree.tsx',
)

for (const [name, source] of [
  ['metadata', metadataDiagramSource],
  ['manifest', manifestDiagramSource],
]) {
  if (!source.includes('<DiagramBranch')) {
    throw new Error(`${name} diagram must use directional DiagramBranch`)
  }
  if (source.includes('diagram-note')) {
    throw new Error(`${name} diagram must prefer figcaption over extra callout card`)
  }
}

const diagramCssV11 = readText('src/styles/diagram-system-v1.css')
if (
  !diagramCssV11.includes('.diagram-branch__tip--left') ||
  !diagramCssV11.includes('.diagram-branch__tip--right')
) {
  throw new Error('One-to-many branch must expose directional arrow tips')
}
if (
  !diagramCssV11.includes('.quick-answer .technical-diagram') ||
  !diagramCssV11.includes('border: 0')
) {
  throw new Error('Embedded Quick Answer diagram must flatten its outer frame')
}

console.log('Technical Diagram optional capability validation passed.')

console.log(
  `Content validation passed: ${taxonomy.stages.length} stages, ` +
    `${interviewBank.questions.length} interview questions, ` +
    `${curatedCount} curated answers, ` +
    `${spine.nodes.length} Iceberg L5 spine nodes, ` +
    `${scenarioFiles.length} hypothetical Iceberg Scale scenarios, ` +
    `Design System V1.6 frozen.`,
)
