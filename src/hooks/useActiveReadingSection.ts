import { useEffect, useState } from 'react'

export function useActiveReadingSection(ids: string[]): string | null {
  const key = ids.join('\u001f')
  const [activeId, setActiveId] = useState<string | null>(
    ids[0] ?? null,
  )

  useEffect(() => {
    const sectionIds = key ? key.split('\u001f') : []

    if (!sectionIds.length) {
      setActiveId(null)
      return
    }

    let frame = 0

    const update = () => {
      frame = 0
      const topMarker = 92
      let current = sectionIds[0]

      for (const id of sectionIds) {
        const element = document.getElementById(id)
        if (!element) continue

        if (element.getBoundingClientRect().top <= topMarker) {
          current = id
        } else {
          break
        }
      }

      const documentHeight = document.documentElement.scrollHeight
      if (
        window.scrollY + window.innerHeight >=
        documentHeight - 24
      ) {
        current = sectionIds[sectionIds.length - 1]
      }

      setActiveId((previous) =>
        previous === current ? previous : current,
      )
    }

    const schedule = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    setActiveId(sectionIds[0])
    update()

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [key])

  return activeId
}
