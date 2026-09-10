import type { MarkdownSection } from '../types/content'
import { MarkdownBlocks } from './MarkdownBlocks'

interface MarkdownSectionsProps {
  sections: MarkdownSection[]
}

export function MarkdownSections({ sections }: MarkdownSectionsProps) {
  return (
    <div className="article-sections">
      {sections.map((section) => (
        <section className="article-section" key={section.title}>
          <h2>{section.title}</h2>
          <MarkdownBlocks markdown={section.body} />
        </section>
      ))}
    </div>
  )
}
