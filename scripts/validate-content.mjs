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

const knowledge = readFrontMatter(
  'content/knowledge/kb-iceberg-overview-001.md',
)

if (
  knowledge.meta?.id !== 'kb-iceberg-overview-001' ||
  knowledge.meta?.type !== 'knowledge' ||
  knowledge.meta?.stage_id !== '04'
) {
  throw new Error('Iceberg knowledge seed Front Matter is invalid')
}

if (!/##\s+30 秒理解/.test(knowledge.body)) {
  throw new Error('Iceberg knowledge seed missing 30 秒理解')
}

console.log(
  `Content validation passed: ${taxonomy.stages.length} stages, ` +
    `${interviewBank.questions.length} interview questions, ` +
    `${curatedCount} curated answers, Knowledge detail seed valid, ` +
    `Design System V1 frozen.`,
)
