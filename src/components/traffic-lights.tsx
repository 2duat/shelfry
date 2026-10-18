export function TrafficLights({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`} aria-hidden="true">
      <span className="size-[10px] rounded-full bg-[#ff5f57] ring-1 ring-inset ring-black/10" />
      <span className="size-[10px] rounded-full bg-[#febc2e] ring-1 ring-inset ring-black/10" />
      <span className="size-[10px] rounded-full bg-[#28c840] ring-1 ring-inset ring-black/10" />
    </div>
  )
}
