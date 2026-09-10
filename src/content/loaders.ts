import yaml from 'js-yaml'
import type { MarkdownDocument, MarkdownSection } from '../types/content'

export interface RawAsset {
  path: string
  raw: string
}

const yamlModules = import.meta.glob('../../content/**/*.yaml', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const markdownModules = import.meta.glob('../../content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function normalizePath(path: string): string {
  return path.replaceAll('\\', '/')
}

function normalizeSuffix(value: string): string {
  return value.replaceAll('\\', '/').replace(/^\/+/, '')
}

function findAsset(
  modules: Record<string, string>,
  suffix: string,
): RawAsset | null {
  const normalized = normalizeSuffix(suffix)
  const entry = Object.entries(modules).find(([path]) =>
    normalizePath(path).endsWith(normalized),
  )

  return entry ? { path: normalizePath(entry[0]), raw: entry[1] } : null
}

function listAssets(
  modules: Record<string, string>,
  contains: string,
): RawAsset[] {
  const normalized = normalizeSuffix(contains)
  return Object.entries(modules)
    .filter(([path]) => normalizePath(path).includes(normalized))
    .map(([path, raw]) => ({ path: normalizePath(path), raw }))
    .sort((a, b) => a.path.localeCompare(b.path))
}

export function parseYaml<T>(raw: string): T {
  return yaml.load(raw) as T
}

export function loadYaml<T>(suffix: string): T {
  const asset = findAsset(yamlModules, suffix)
  if (!asset) {
    throw new Error(`YAML content not found: ${suffix}`)
  }

  return parseYaml<T>(asset.raw)
}

export function listYamlAssets(contains: string): RawAsset[] {
  return listAssets(yamlModules, contains)
}

export function loadMarkdownRaw(suffix: string): string {
  const asset = findAsset(markdownModules, suffix)
  if (!asset) {
    throw new Error(`Markdown content not found: ${suffix}`)
  }

  return asset.raw
}

export function tryLoadMarkdownRaw(suffix: string): string | null {
  return findAsset(markdownModules, suffix)?.raw ?? null
}

export function listMarkdownAssets(contains: string): RawAsset[] {
  return listAssets(markdownModules, contains)
}

export function parseFrontMatter<TMeta extends object>(
  path: string,
  raw: string,
): MarkdownDocument<TMeta> {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/)

  if (!match) {
    const body = raw.trim()
    return {
      path,
      raw,
      meta: {} as TMeta,
      body,
      title: extractH1(body),
    }
  }

  const parsed = parseYaml<unknown>(match[1])
  const meta =
    parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as TMeta)
      : ({} as TMeta)

  const metaRecord = meta as unknown as Record<string, unknown>
  const body = match[2].trim()

  return {
    path,
    raw,
    meta,
    body,
    title:
      typeof metaRecord.title === 'string'
        ? metaRecord.title
        : extractH1(body),
  }
}

export function extractH1(markdown: string): string | null {
  const line = markdown.split('\n').find((value) => /^#\s+/.test(value))
  return line ? line.replace(/^#\s+/, '').trim() : null
}

export function splitH2Sections(markdown: string): MarkdownSection[] {
  const sections: MarkdownSection[] = []
  const lines = markdown.split('\n')
  let title: string | null = null
  let buffer: string[] = []

  const flush = () => {
    if (!title) return
    sections.push({
      title,
      body: buffer.join('\n').trim(),
    })
  }

  for (const line of lines) {
    const heading = line.match(/^##\s+(.+)$/)
    if (heading) {
      flush()
      title = heading[1].trim()
      buffer = []
      continue
    }

    if (title) {
      buffer.push(line)
    }
  }

  flush()
  return sections
}

export function listContentFiles(): string[] {
  return [...Object.keys(yamlModules), ...Object.keys(markdownModules)].sort()
}
