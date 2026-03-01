'use client'

import { useState, useMemo } from 'react'
import ScreenshotCard from '../../../components/ScreenshotCard'
import ScreenshotModal from '../../../components/ScreenshotModal'

interface GameDetailClientProps {
  game: any
  genreNames: string[]
  screenshots: any[]
  elements: { name: string; slug: string; group_name: string; count: number }[]
}

export default function GameDetailClient({
  game,
  genreNames,
  screenshots,
  elements,
}: GameDetailClientProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [modalIndex, setModalIndex] = useState<number | null>(null)

  // Filter screenshots
  const filteredScreenshots = useMemo(() => {
    if (activeFilters.length === 0) return screenshots
    return screenshots.filter((s) =>
      activeFilters.some((filter) => s.element_slugs?.includes(filter))
    )
  }, [screenshots, activeFilters])

  const toggleFilter = (slug: string) => {
    setActiveFilters((prev) =>
      prev.includes(slug)
        ? prev.filter((f) => f !== slug)
        : [...prev, slug]
    )
  }

  // Group elements by group_name
  const elementGroups = useMemo(() => {
    const groups = new Map<string, typeof elements>()
    elements.forEach((el) => {
      const group = groups.get(el.group_name) || []
      group.push(el)
      groups.set(el.group_name, group)
    })
    return Array.from(groups.entries()).map(([name, items]) => ({ name, items }))
  }, [elements])

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[40vh] flex items-end overflow-hidden">
        {game.hero_image_url && (
          <img
            src={game.hero_image_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 pb-8 w-full flex items-end gap-6">
          {/* Cover */}
          {game.cover_image_url && (
            <img
              src={game.cover_image_url}
              alt={game.name}
              className="w-24 h-32 object-cover rounded-lg border border-zinc-700 shadow-2xl"
            />
          )}
          <div>
            <h1 className="text-4xl font-bold">{game.name}</h1>
            {game.release_date && (
              <p className="text-sm text-zinc-400 mt-1">
                {new Date(game.release_date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
            {genreNames.length > 0 && (
              <div className="flex gap-2 mt-2">
                {genreNames.map((genre) => (
                  <span
                    key={genre}
                    className="text-xs px-2.5 py-1 rounded border border-zinc-600 text-zinc-300"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-12">
          {/* Sidebar – Element Filter */}
          <aside className="w-56 shrink-0">
            <div className="sticky top-24">
              {/* Sort */}
              <div className="mb-6">
                <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-3">
                  Sort by
                </h3>
                <select className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white">
                  <option>Most popular</option>
                  <option>Newest first</option>
                  <option>A–Z</option>
                </select>
              </div>

              {/* Element Filters */}
              <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-3">
                Elements
              </h3>

              {activeFilters.length > 0 && (
                <button
                  onClick={() => setActiveFilters([])}
                  className="text-xs text-zinc-500 hover:text-white mb-3 underline"
                >
                  Clear filters
                </button>
              )}

              {elementGroups.map(({ name, items }) => (
                <div key={name} className="mb-4">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2">{name}</p>
                  {items.map((el) => {
                    const isActive = activeFilters.includes(el.slug)
                    return (
                      <button
                        key={el.slug}
                        onClick={() => toggleFilter(el.slug)}
                        className={`w-full flex items-center justify-between py-1 text-sm transition-colors ${
                          isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                              isActive ? 'bg-white border-white' : 'border-zinc-600'
                            }`}
                          >
                            {isActive && (
                              <svg className="w-2 h-2 text-black" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <span>{el.name}</span>
                        </div>
                        <span className="text-xs text-zinc-600 tabular-nums">{el.count}</span>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </aside>

          {/* Screenshot Grid */}
          <div className="flex-1">
            <p className="text-sm text-zinc-500 mb-6">
              {filteredScreenshots.length} screenshot{filteredScreenshots.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredScreenshots.map((s: any, index: number) => (
                <ScreenshotCard
                  key={s.slug}
                  title={s.title}
                  slug={s.slug}
                  image_url={s.image_url}
                  thumbnail_url={s.thumbnail_url}
                  element_names={s.element_names}
                  media_type={s.media_type}
                  onOpen={() => setModalIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {modalIndex !== null && filteredScreenshots[modalIndex] && (
        <ScreenshotModal
          screenshot={{
            ...filteredScreenshots[modalIndex],
            game_name: game.name,
            game_slug: game.slug,
          }}
          onClose={() => setModalIndex(null)}
          onPrev={() => setModalIndex((prev) => Math.max(0, (prev || 0) - 1))}
          onNext={() =>
            setModalIndex((prev) =>
              Math.min(filteredScreenshots.length - 1, (prev || 0) + 1)
            )
          }
          hasPrev={modalIndex > 0}
          hasNext={modalIndex < filteredScreenshots.length - 1}
        />
      )}
    </div>
  )
}