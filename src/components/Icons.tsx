import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export function LearnIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5.5h11a3 3 0 0 1 3 3V19H7a3 3 0 0 1-3-3V5.5Z" />
      <path d="M7 8.5h7M7 12h7" />
    </svg>
  )
}

export function InterviewIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 4.5h14v12H9l-4 3v-15Z" />
      <path d="M8 8h8M8 11.5h5" />
    </svg>
  )
}

export function ScaleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 18 10 7l4 7 2-3 4 7H4Z" />
    </svg>
  )
}

export function ProjectsIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 5V3.5h8V5M8 10h8" />
    </svg>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  )
}

export function ChevronIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}
