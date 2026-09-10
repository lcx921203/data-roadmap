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

if (components?.status !== 'frozen' || components?.version !== '1.0') {
  throw new Error('Design components-v1.yaml must remain frozen at V1')
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
  spine?.version !== '0.6.0' ||
  spine?.topic !== 'iceberg' ||
  !Array.isArray(spine?.nodes) ||
  spine.nodes.length !== 10
) {
  throw new Error('Iceberg V0.6.0 spine must contain exactly 10 ordered nodes')
}

const knowledgeIds = new Set()
const orders = new Set()

for (const node of spine.nodes) {
  const candidates = fs
    .readdirSync(path.join(root, 'content/knowledge'))
    .filter((name) => name.endsWith('.md'))

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

console.log(
  `Content validation passed: ${taxonomy.stages.length} stages, ` +
    `${interviewBank.questions.length} interview questions, ` +
    `${curatedCount} curated answers, ` +
    `${spine.nodes.length} Iceberg L5 spine nodes, ` +
    `${scenarioFiles.length} hypothetical Iceberg Scale scenarios, ` +
    `Design System V1 frozen.`,
)
