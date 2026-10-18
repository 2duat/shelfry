import { cn } from '@/lib/utils'

export function ItemIcon({
  src,
  name,
  size = 44,
  className,
}: {
  src?: string | null
  name: string
  size?: number
  className?: string
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        className={cn('shrink-0 rounded-[11px] border border-line bg-white object-cover', className)}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-[11px] bg-gradient-to-br from-[#6366f1] to-[#3b82f6] font-semibold text-white',
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  )
}
