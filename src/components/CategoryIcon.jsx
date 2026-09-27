import { CATEGORY_META } from '../data/mockData'
import { getIcon, getMerchantIcon } from './ui/Icon'

const SIZES = {
  sm: { box: 'h-9 w-9', icon: 16, radius: 'rounded-xl' },
  md: { box: 'h-10 w-10', icon: 18, radius: 'rounded-xl' },
  lg: { box: 'h-12 w-12', icon: 20, radius: 'rounded-2xl' },
}

/** Category-tinted icon chip — uses the merchant icon when available */
export default function CategoryIcon({
  category = 'Other',
  description = '',
  size = 'md',
  merchant = true,
}) {
  const meta = CATEGORY_META[category] || CATEGORY_META.Other
  const Icon =
    merchant && description ? getMerchantIcon(description) : getIcon(meta.icon)
  const dims = SIZES[size] || SIZES.md

  return (
    <span
      className={`grid shrink-0 place-items-center ${dims.box} ${dims.radius} ${meta.soft}`}
      style={{ color: meta.color }}
    >
      <Icon size={dims.icon} strokeWidth={2.1} />
    </span>
  )
}
