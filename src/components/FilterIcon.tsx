import type { SVGProps } from 'react'

export function FilterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 5h16l-6.4 7.3v5.2l-3.2 1.5v-6.7L4 5Z" />
    </svg>
  )
}
