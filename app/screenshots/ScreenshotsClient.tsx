'use client'

import { useState, useMemo } from 'react'
import FilterSidebar from '@/components/FilterSidebar'
import ScreenshotCard from '@/components/ScreenshotCard'
import ScreenshotModal from '@/components/ScreenshotModal'

type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a'

interface ScreenshotsClientProps {
  screenshots: any[]
  filterGroups: {
    group_name: string
    items: { slug: string; name: string; count: number }[]
  }[]
  totalCount: number
}

export default function ScreenshotsClient({
  screenshots,
  filterGroups,
  totalCount,
}: ScreenshotsClientProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [modalIndex, setModalIndex] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter + Sort + Search
  const filteredScreenshots = useMemo(() => {
    let result = [...screenshots]

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.game_name?.toLowerCase().includes(q) ||
          s.element_names?.some((el: string) => el.toLowerCase().includes(q))
      )
    }

    // Element filter
    if (activeFilters.length > 0) {
      result = result.filter((s) =>
        activeFilters.some((filter) => s.element_slugs?.includes(filter))
      )
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        // already sorted by created_at desc from server
        break
      case 'oldest':
        result.reverse()
        break
      case 'a-z':
        result.sort((a, b) => (a.game_name || '').localeCompare(b.game_name || ''))
        break
      case 'z-a':
        result.sort((a, b) => (b.game_name || '').localeCompare(a.game_name || ''))
        break
    }

    return result
  }, [screenshots, activeFilters, sortBy, searchQuery])

  const toggleFilter = (slug: string) => {
    setActiveFilters((prev) =>
      prev.includes(slug)
        ? prev.filter((f) => f !== slug)
        : [...prev, slug]
    )
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[30vh] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary to-background" />
        <div className="relative max-w-7xl mx-auto px-6 pb-8 w-full">
          <h1 className="text-4xl font-bold text-foreground">Screenshots</h1>
          <p className="text-muted-foreground mt-2">
            {totalCount} screenshots, elements, and clips
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-12">
          {/* Filter Sidebar */}
          <div className="w-64 shrink-0">
            <div className="sticky top-24">
              {/* Search */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search screenshots..."
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
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="a-z">A – Z</option>
                  <option value="z-a">Z – A</option>
                </select>
              </div>

              {/* Element Filters */}
              <FilterSidebar
                groups={filterGroups}
                activeFilters={activeFilters}
                onFilterChange={toggleFilter}
                onClearAll={() => setActiveFilters([])}
              />
            </div>
          </div>

          {/* Screenshot Grid */}
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-6">
              Showing {filteredScreenshots.length} of {totalCount} screenshots
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredScreenshots.map((s: any, index: number) => (
                <ScreenshotCard
                  key={s.slug}
                  title={s.title}
                  slug={s.slug}
                  image_url={s.image_url}
                  thumbnail_url={s.thumbnail_url}
                  game_name={s.game_name}
                  game_slug={s.game_slug}
                  element_names={s.element_names}
                  media_type={s.media_type}
                  onOpen={() => setModalIndex(index)}
                />
              ))}
            </div>

            {filteredScreenshots.length === 0 && (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">No screenshots match your filters.</p>
                <button
                  onClick={() => {
                    setActiveFilters([])
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

      {/* Modal */}
      {modalIndex !== null && filteredScreenshots[modalIndex] && (
        <ScreenshotModal
          screenshot={filteredScreenshots[modalIndex]}
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
