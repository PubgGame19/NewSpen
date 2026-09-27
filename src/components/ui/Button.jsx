const VARIANTS = {
  primary: 'btn-primary',
  ghost: 'btn-ghost',
  soft: 'btn-soft',
  danger: 'btn-danger',
}

const SIZES = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
}

export default function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  className = '',
  children,
  type = 'button',
  ...props
}) {
  return (
    <Tag
      type={Tag === 'button' ? type : undefined}
      className={`btn ${VARIANTS[variant] || VARIANTS.primary} ${
        SIZES[size] || SIZES.md
      } ${className}`}
      {...props}
    >
      {Icon ? <Icon size={16} strokeWidth={2.2} className="shrink-0" /> : null}
      {children}
      {IconRight ? (
        <IconRight size={16} strokeWidth={2.2} className="shrink-0" />
      ) : null}
    </Tag>
  )
}
