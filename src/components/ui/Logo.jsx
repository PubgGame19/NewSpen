/**
 * SPENANCE logo.
 *
 * The mark artwork ships in two flavours — `*-on-light.png` keeps the original
 * black/red/gold ink for light surfaces, `*-on-dark.png` recolours the neutral
 * ink to white so the logo stays legible on dark surfaces and on the emerald
 * brand panel. `tone="auto"` (the default) swaps them with the app's class
 * based dark mode; `tone="on-dark"` pins the white version for panels that are
 * always dark regardless of the theme.
 */
export default function Logo({
  variant = 'mark',
  tone = 'auto',
  alt = 'SPENANCE',
  className = '',
  ...props
}) {
  const slug = variant === 'lockup' ? 'lockup' : 'mark'

  if (tone !== 'auto') {
    return (
      <img
        src={`/brand/${slug}-${tone}.png`}
        alt={alt}
        className={`inline-block shrink-0 object-contain ${className}`}
        {...props}
      />
    )
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center ${className}`}
      {...props}
    >
      <img
        src={`/brand/${slug}-on-light.png`}
        alt={alt}
        className="h-full w-auto object-contain dark:hidden"
      />
      <img
        src={`/brand/${slug}-on-dark.png`}
        alt=""
        aria-hidden="true"
        className="hidden h-full w-auto object-contain dark:block"
      />
    </span>
  )
}
