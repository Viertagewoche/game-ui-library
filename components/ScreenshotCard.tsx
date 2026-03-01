'use client'

import { useState } from 'react'

interface ScreenshotCardProps {
  title: string
  slug: string
  image_url: string
  thumbnail_url: string | null
  game_name?: string
  game_slug?: string
  element_names?: string[]
  media_type?: string
  onOpen?: () => void
}

export default function ScreenshotCard({
  title,
  image_url,
  thumbnail_url,
  game_name,
  element_names,
  media_type,
  onOpen,
}: ScreenshotCardProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      className="group cursor-pointer"
      onClick={onOpen}
    >
      <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all duration-300">
        {/* Screenshot Image */}
        <div className="aspect-video relative overflow-hidden">
          {/* Video Badge */}
          {media_type === 'video' && (
            <div className="absolute top-2 right-2 z-10 bg-black/70 text-white text-xs px-2 py-1 rounded">
              VIDEO
            </div>
          )}

          {/* Loading Skeleton */}
          {!loaded && (
            <div className="absolute inset-0 bg-zinc-800 animate-pulse" />
          )}

          <img
            src={thumbnail_url || image_url}
            alt={title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
          />
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-medium text-white text-sm leading-tight mb-1.5">{title}</h3>

          {/* Game Name */}
          {game_name && (
            <p className="text-xs text-zinc-500 mb-2">{game_name}</p>
          )}

          {/* Element Tags */}
          {element_names && element_names.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {element_names.map((el) => (
                <span
                  key={el}
                  className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-zinc-700 text-zinc-400"
                >
                  {el}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}