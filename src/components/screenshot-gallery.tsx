'use client'

import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

type Shot = { url: string; caption?: string; id?: string }

export function ScreenshotGallery({ shots }: { shots: Shot[] }) {
  const [active, setActive] = useState<number | null>(null)

  if (!shots.length) return null

  return (
    <>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {shots.map((shot, index) => (
          <button
            key={shot.id || shot.url}
            type="button"
            onClick={() => setActive(index)}
            className="group relative overflow-hidden rounded-[12px] border border-line bg-surface-soft text-left"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shot.url}
              alt={shot.caption || '截图'}
              loading="lazy"
              className="aspect-[16/10] w-full object-cover transition duration-300 group-hover:scale-[1.015]"
            />
            {shot.caption ? (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2 pt-8 text-[11.5px] text-white/90">
                {shot.caption}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {active !== null ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] grid place-items-center bg-black/80 p-6 backdrop-blur-sm"
            onClick={() => setActive(null)}
          >
            <button
              type="button"
              aria-label="关闭"
              className="absolute right-5 top-5 grid size-9 place-items-center rounded-full bg-white/10 text-white"
            >
              <X size={18} />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={shots[active].url}
              alt={shots[active].caption || '截图'}
              className="max-h-[86vh] max-w-[92vw] rounded-[12px] object-contain shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
