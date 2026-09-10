import yaml from 'js-yaml'

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

function findAsset(
  modules: Record<string, string>,
  suffix: string,
): { path: string; raw: string } | null {
  const normalized = suffix.replace(/^\/+/, '')
  const entry = Object.entries(modules).find(([path]) =>
    path.replaceAll('\\', '/').endsWith(normalized),
  )

  return entry ? { path: entry[0], raw: entry[1] } : null
}

export function loadYaml<T>(suffix: string): T {
  const asset = findAsset(yamlModules, suffix)
  if (!asset) {
    throw new Error(`YAML content not found: ${suffix}`)
  }

  return yaml.load(asset.raw) as T
}

export function loadMarkdownRaw(suffix: string): string {
  const asset = findAsset(markdownModules, suffix)
  if (!asset) {
    throw new Error(`Markdown content not found: ${suffix}`)
  }

  return asset.raw
}

export function listContentFiles(): string[] {
  return [...Object.keys(yamlModules), ...Object.keys(markdownModules)].sort()
}
