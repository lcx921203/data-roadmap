import { useState } from 'react'
import type { ReadingDirectoryItem } from '../utils/readingDirectory'
import { ReadingFloatingControl } from './ReadingFloatingControl'
import { ReadingSideDrawer } from './ReadingSideDrawer'

interface ReadingDirectoryControllerProps {
  items: ReadingDirectoryItem[]
  activeId: string | null
}

export function ReadingDirectoryController({
  items,
  activeId,
}: ReadingDirectoryControllerProps) {
  const [open, setOpen] = useState(false)

  if (!items.length) return null

  return (
    <>
      <ReadingFloatingControl
        open={open}
        onToggle={() => setOpen((value) => !value)}
      />
      <ReadingSideDrawer
        open={open}
        items={items}
        activeId={activeId}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
