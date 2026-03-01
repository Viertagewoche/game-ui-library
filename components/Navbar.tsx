'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'

interface SearchResult {
  type: 'game' | 'screenshot'
  name: string
  slug: string
  image_url?: string | null
  game_slug?: string
}

export default function Navbar() {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setQuery('')
        setResults([])
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [searchOpen])

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timeout = setTimeout(async () => {
      setLoading(true)

      // Search games
      const { data: games } = await supabase
        .from('games')
        .select('name, slug, cover_image_url')
        .ilike('name', `%${query}%`)
        .limit(5)

      // Search screenshots
      const { data: screenshots } = await supabase
        .from('screenshots')
        .select('title, slug, thumbnail_url, games (slug)')
        .ilike('title', `%${query}%`)
        .limit(5)

      const gameResults: SearchResult[] = (games || []).map((g) => ({
        type: 'game',
        name: g.name,
        slug: g.slug,
        image_url: g.cover_image_url,
      }))

      const screenshotResults: SearchResult[] = (screenshots || []).map((s: any) => ({
        type: 'screenshot',
        name: s.title,
        slug: s.slug,
        image_url: s.thumbnail_url,
        game_slug: s.games?.slug,
      }))

      setResults([...gameResults, ...screenshotResults])
      setLoading(false)
    }, 300) // Debounce 300ms

    return () => clearTimeout(timeout)
  }, [query])

  const isActive = (path: string) => pathname.startsWith(path)

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-foreground">Game</span>
            <span className="text-muted-foreground">UI</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            <Link
              href="/games"
              className={`text-sm uppercase tracking-widest transition-colors ${
                isActive('/games') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Games
            </Link>
            <Link
              href="/screenshots"
              className={`text-sm uppercase tracking-widest transition-colors ${
                isActive('/screenshots') ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Screenshots
            </Link>

            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">
                ⌘K
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[200]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => {
              setSearchOpen(false)
              setQuery('')
              setResults([])
            }}
          />

          {/* Search Panel */}
          <div className="relative max-w-xl mx-auto mt-[20vh]">
            <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
              {/* Input */}
              <div className="flex items-center gap-3 px-4 border-b border-border">
                <svg className="w-5 h-5 text-muted-foreground shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search games and screenshots..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent py-4 text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button
                  onClick={() => {
                    setSearchOpen(false)
                    setQuery('')
                    setResults([])
                  }}
                  className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5"
                >
                  ESC
                </button>
              </div>

              {/* Results */}
              {query.trim() && (
                <div className="max-h-[40vh] overflow-y-auto">
                  {loading ? (
                    <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                      Searching...
                    </div>
                  ) : results.length > 0 ? (
                    <div className="py-2">
                      {results.map((result, i) => (
                        <Link
                          key={`${result.type}-${result.slug}-${i}`}
                          href={
                            result.type === 'game'
                              ? `/games/${result.slug}`
                              : `/games/${result.game_slug || ''}`
                          }
                          onClick={() => {
                            setSearchOpen(false)
                            setQuery('')
                            setResults([])
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent transition-colors"
                        >
                          {/* Thumbnail */}
                          {result.image_url ? (
                            <img
                              src={result.image_url}
                              alt=""
                              className="w-10 h-10 rounded object-cover bg-muted"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-muted-foreground">
                              {result.type === 'game' ? 'G' : 'S'}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground truncate">{result.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{result.type}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                      No results for &ldquo;{query}&rdquo;
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
