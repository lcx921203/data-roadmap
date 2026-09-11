export interface ReadingDirectoryItem {
  id: string
  label: string
  level: 2 | 3
}

export function makeSubheadingId(
  sectionId: string,
  index: number,
  label: string,
): string {
  return `${sectionId}--h3-${index}-${encodeURIComponent(label)}`
}

export function makeDetailItemId(
  sectionId: string,
  index: number,
): string {
  return `${sectionId}--item-${index}`
}

export function extractMarkdownSubheadings(
  markdown: string,
  sectionId: string,
): ReadingDirectoryItem[] {
  let index = 0

  return markdown.split('\n').flatMap((line) => {
    const match = line.match(/^###\s+(.+)$/)
    if (!match) return []

    const label = match[1].trim()
    const item: ReadingDirectoryItem = {
      id: makeSubheadingId(sectionId, index, label),
      label,
      level: 3,
    }
    index += 1
    return [item]
  })
}
