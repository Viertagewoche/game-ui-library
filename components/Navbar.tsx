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

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [searchOpen])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timeout = setTimeout(async () => {
      setLoading(true)

      const { data: games } = await supabase
        .from('games')
        .select('name, slug, cover_image_url')
        .ilike('name', `%${query}%`)
        .limit(5)

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
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  return (
    <>
      <nav className="sticky top-0 left-0 right-0 z-50 w-full bg-neutral-950 border-b border-neutral-800">
        <div className="w-full px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-sm font-bold tracking-widest uppercase text-neutral-50">
            UXSE Tools
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className={`text-xs uppercase tracking-widest transition-colors ${
                pathname === '/' ? 'text-neutral-50' : 'text-neutral-500 hover:text-neutral-50'
              }`}
            >
              Explore
            </Link>
            <Link
              href="/games"
              className={`text-xs uppercase tracking-widest transition-colors ${
                isActive('/games') ? 'text-neutral-50' : 'text-neutral-500 hover:text-neutral-50'
              }`}
            >
              Games
            </Link>
            <Link
              href="/screenshots"
              className={`text-xs uppercase tracking-widest transition-colors ${
                isActive('/screenshots') ? 'text-neutral-50' : 'text-neutral-500 hover:text-neutral-50'
              }`}
            >
              Screenshots
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-neutral-50 hover:text-neutral-300 transition-colors"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Submit Game Button */}
            <Link
              href="https://google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-xs uppercase tracking-widest text-neutral-50 border border-neutral-700 hover:border-neutral-500 transition-colors"
            >
              Submit Game
            </Link>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[200]" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setSearchOpen(false)
            setQuery('')
            setResults([])
          }
        }}>
          <div className="absolute inset-0 bg-neutral-950/70 backdrop-blur-sm" />

          <div className="relative max-w-2xl mx-auto mt-[15vh]">
            <div className="bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-800">
                <svg className="w-5 h-5 text-neutral-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search games and screenshots..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent py-2 text-neutral-50 placeholder:text-neutral-600 focus:outline-none"
                />
                <button
                  onClick={() => {
                    setSearchOpen(false)
                    setQuery('')
                    setResults([])
                  }}
                  className="text-xs text-neutral-500 border border-neutral-700 px-2 py-1"
                >
                  ESC
                </button>
              </div>

              {query.trim() && (
                <div className="max-h-[50vh] overflow-y-auto">
                  {loading ? (
                    <div className="px-6 py-8 text-center text-neutral-500 text-sm">
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
                          className="flex items-center gap-3 px-6 py-3 hover:bg-neutral-800 transition-colors"
                        >
                          {result.image_url ? (
                            <img
                              src={result.image_url}
                              alt=""
                              className="w-10 h-10 object-cover bg-neutral-800 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-neutral-800 flex items-center justify-center text-neutral-600 flex-shrink-0 text-xs">
                              {result.type === 'game' ? 'G' : 'S'}
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-neutral-50 truncate">{result.name}</p>
                            <p className="text-xs text-neutral-500 capitalize">{result.type}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="px-6 py-8 text-center text-neutral-500 text-sm">
                      {'No results for "'}{query}{'"'}
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
