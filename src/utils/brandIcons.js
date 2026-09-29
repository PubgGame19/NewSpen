/**
 * Keep the browser chrome (tab icon + theme colour) in step with the app theme.
 *
 * index.html declares the tab icon four times — a `.ico` (16/32/48) and a 96px
 * PNG, each in a light and a dark flavour — because that is all the platform
 * offers:
 *   · `<link rel="icon" media="(prefers-color-scheme: …)">` is honoured by modern
 *     browsers, while the web app manifest has no per-scheme icon member (the
 *     512px alpha-only mask shipped as `purpose: "monochrome"` is the
 *     manifest-side, themed hook).
 *   · `<meta name="theme-color" media="…">` colours the browser UI bar.
 *
 * SPENANCE's dark mode is a user toggle (`.dark` on <html>) rather than purely
 * OS-driven, so a toggled dark theme also re-points the light declarations at the
 * dark artwork. A dark app therefore always gets dark chrome, and the OS scheme
 * decides only while the app is in its light theme.
 */

const ICONS = {
  light: { ico: '/favicon.ico', png: '/favicon.png' },
  dark: { ico: '/favicon-dark.ico', png: '/favicon-dark.png' },
}

const THEME_COLORS = { light: '#047857', dark: '#0b1220' }

export function syncBrowserChrome(theme) {
  if (typeof document === 'undefined') return
  const appDark = theme === 'dark'

  document.querySelectorAll('link[rel="icon"][data-favicon]').forEach((link) => {
    const [declared, format] = link.dataset.favicon.split('-')
    const tone = appDark || declared === 'dark' ? 'dark' : 'light'
    link.href = ICONS[tone][format] || ICONS[tone].png
  })

  document
    .querySelectorAll('meta[name="theme-color"][data-theme-color]')
    .forEach((meta) => {
      const tone = appDark || meta.dataset.themeColor === 'dark' ? 'dark' : 'light'
      meta.content = THEME_COLORS[tone]
    })
}
