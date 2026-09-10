import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'

const root = process.cwd()

function readYaml(relativePath) {
  const fullPath = path.join(root, relativePath)

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Required content file is missing: ${relativePath}`)
  }

  return yaml.load(fs.readFileSync(fullPath, 'utf8'))
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
  throw new Error('Interview Bank V1 must contain exactly the selected first 30 questions')
}

if (components?.status !== 'frozen' || components?.version !== '1.0') {
  throw new Error('Design components-v1.yaml must remain frozen at V1')
}

const ids = new Set()
for (const question of interviewBank.questions) {
  if (!question?.id) {
    throw new Error('Interview question without stable ID')
  }
  if (ids.has(question.id)) {
    throw new Error(`Duplicate interview question ID: ${question.id}`)
  }
  ids.add(question.id)
}

console.log(
  `Content validation passed: ${taxonomy.stages.length} stages, ` +
    `${interviewBank.questions.length} interview questions, Design System V1 frozen.`,
)
