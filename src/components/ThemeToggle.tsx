import { MoonIcon, SunIcon } from './Icons'
import { useTheme } from '../theme/ThemeProvider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const label = isDark
    ? '当前为深色模式，切换为浅色模式'
    : '当前为浅色模式，切换为深色模式'

  return (
    <button
      className="icon-button theme-toggle"
      type="button"
      aria-label={label}
      aria-pressed={isDark}
      title={label}
      onClick={toggleTheme}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}
