const MODE_KEY = 'theme'
export const THEME_MODES = ['light', 'dark', 'auto']

const darkMedia = window.matchMedia('(prefers-color-scheme: dark)')

// 模式：light 浅色 / dark 深色 / auto 跟随系统，默认跟随系统
let mode = localStorage.getItem(MODE_KEY)
if (!THEME_MODES.includes(mode)) mode = 'auto'

// 生效的主题变化监听器（用户切换或系统切换都会触发）
const listeners = new Set()

function effectiveDark() {
  return mode === 'auto' ? darkMedia.matches : mode === 'dark'
}

function apply() {
  const dark = effectiveDark()
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  listeners.forEach((cb) => cb(dark))
}

export function getThemeMode() {
  return mode
}

export function setThemeMode(value) {
  if (!THEME_MODES.includes(value)) return
  mode = value
  localStorage.setItem(MODE_KEY, value)
  apply()
}

// 供外部查询当前是否为暗黑模式（生效值）
export function isDark() {
  return effectiveDark()
}

// 供外部监听主题变化，返回取消监听函数
export function onThemeChange(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

apply()
// auto 模式下跟随系统切换
darkMedia.addEventListener('change', () => {
  if (mode === 'auto') apply()
})
