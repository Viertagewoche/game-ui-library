'use client'

import { useState, useMemo } from 'react'
import GameCard from '@/components/GameCard'

interface Game {
  id: string
  name: string
  slug: string
  cover_image_url: string | null
  hero_image_url: string | null
  release_date: string | null
  genre_names: string[] | null
  screenshot_count: number
}

interface Genre {
  id: string
  name: string
  slug: string
  game_count: number
}

type SortOption = 'name-asc' | 'name-desc' | 'newest' | 'most-screenshots'

export default function GamesClient({
  games,
  genres,
}: {
  games: Game[]
  genres: Genre[]
}) {
  const [activeGenres, setActiveGenres] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('most-screenshots')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter + Sort + Search
  const filteredGames = useMemo(() => {
    let result = [...games]

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.genre_names?.some((genre) => genre.toLowerCase().includes(q))
      )
    }

    // Genre filter
    if (activeGenres.length > 0) {
      result = result.filter((g) =>
        activeGenres.some((genre) =>
          g.genre_names?.map((n) => n.toLowerCase()).includes(genre.toLowerCase())
        )
      )
    }

    // Sort
    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
      case 'newest':
        result.sort((a, b) => {
          if (!a.release_date) return 1
          if (!b.release_date) return -1
          return new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
        })
        break
      case 'most-screenshots':
        result.sort((a, b) => (b.screenshot_count || 0) - (a.screenshot_count || 0))
        break
    }

    return result
  }, [games, activeGenres, sortBy, searchQuery])

  const toggleGenre = (genreName: string) => {
    setActiveGenres((prev) =>
      prev.includes(genreName)
        ? prev.filter((g) => g !== genreName)
        : [...prev, genreName]
    )
  }

  // Recalculate genre counts based on current search
  const genreCountsFiltered = useMemo(() => {
    if (!searchQuery.trim()) return null // use original counts
    const counts = new Map<string, number>()
    games
      .filter((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .forEach((g) => {
        g.genre_names?.forEach((genre) => {
          counts.set(genre, (counts.get(genre) || 0) + 1)
        })
      })
    return counts
  }, [games, searchQuery])

  return (
    <div>
      {/* Hero Banner */}
      <section className="relative h-[30vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary to-background" />
        <div className="relative max-w-7xl mx-auto px-6 pb-8 w-full">
          <h1 className="text-4xl font-bold text-foreground">Games</h1>
          <p className="text-muted-foreground mt-2">
            {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''} 
            {activeGenres.length > 0 && ` in ${activeGenres.join(', ')}`}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-12">
          {/* Sidebar */}
          <aside className="w-56 shrink-0">
            <div className="sticky top-24">
              {/* Search */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-card border border-input rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-ring transition-colors"
                />
              </div>

              {/* Sort */}
              <div className="mb-6">
                <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">
                  Sort by
                </h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full bg-card border border-input rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-ring"
                >
                  <option value="most-screenshots">Most screenshots</option>
                  <option value="newest">Newest first</option>
                  <option value="name-asc">A – Z</option>
                  <option value="name-desc">Z – A</option>
                </select>
              </div>

              {/* Genre Filter */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                    Genres
                  </h3>
                  {activeGenres.length > 0 && (
                    <button
                      onClick={() => setActiveGenres([])}
                      className="text-[10px] text-muted-foreground hover:text-foreground underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-0.5">
                  {genres.map((genre) => {
                    const isActive = activeGenres.includes(genre.name)
                    const count = genreCountsFiltered
                      ? genreCountsFiltered.get(genre.name) || 0
                      : genre.game_count

                    if (genreCountsFiltered && count === 0) return null

                    return (
                      <button
                        key={genre.slug}
                        onClick={() => toggleGenre(genre.name)}
                        className={`w-full flex items-center justify-between py-1.5 text-sm transition-colors ${
                          isActive
                            ? 'text-foreground'
                            : 'text-muted-foreground hover:text-foreground/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              isActive
                                ? 'bg-primary border-primary'
                                : 'border-input'
                            }`}
                          >
                            {isActive && (
                              <svg className="w-2.5 h-2.5 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <span>{genre.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground/60 tabular-nums">{count}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Game Grid */}
          <div className="flex-1">
            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredGames.map((game) => (
                  <GameCard
                    key={game.slug}
                    name={game.name}
                    slug={game.slug}
                    cover_image_url={game.cover_image_url}
                    genre_names={game.genre_names || []}
                    screenshot_count={game.screenshot_count}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">No games found.</p>
                <button
                  onClick={() => {
                    setActiveGenres([])
                    setSearchQuery('')
                  }}
                  className="mt-4 text-sm text-muted-foreground hover:text-foreground underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
