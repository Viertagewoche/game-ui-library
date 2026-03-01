'use client'

import { useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Screenshot {
  title: string
  slug: string
  image_url: string
  game_name?: string
  game_slug?: string
  element_names?: string[]
}

interface ScreenshotModalProps {
  screenshot: Screenshot
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
  hasPrev?: boolean
  hasNext?: boolean
}

export default function ScreenshotModal({
  screenshot,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: ScreenshotModalProps) {
  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev && onPrev) onPrev()
      if (e.key === 'ArrowRight' && hasNext && onNext) onNext()
    },
    [onClose, onPrev, onNext, hasPrev, hasNext]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [handleKeyDown])

  const handleDownload = async () => {
    try {
      const response = await fetch(screenshot.image_url)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${screenshot.slug}.webp`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      window.open(screenshot.image_url, '_blank')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center text-foreground transition-colors"
        aria-label="Close modal"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Prev Button */}
      {hasPrev && onPrev && (
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center text-foreground text-xl transition-colors"
          aria-label="Previous screenshot"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Next Button */}
      {hasNext && onNext && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-secondary/80 hover:bg-secondary flex items-center justify-center text-foreground text-xl transition-colors"
          aria-label="Next screenshot"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-4">
        {/* Image */}
        <div className="relative">
          <img
            src={screenshot.image_url}
            alt={screenshot.title}
            className="w-full rounded-lg"
          />
        </div>

        {/* Bottom Bar */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h2 className="text-foreground font-semibold text-lg">{screenshot.title}</h2>
            <div className="flex items-center gap-3 mt-1">
              {/* Element Tags */}
              {screenshot.element_names && screenshot.element_names.length > 0 && (
                <div className="flex gap-1.5">
                  {screenshot.element_names.map((el) => (
                    <span
                      key={el}
                      className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border border-border text-muted-foreground"
                    >
                      {el}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Game Page Link */}
            {screenshot.game_slug && (
              <Link
                href={`/games/${screenshot.game_slug}`}
                className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-ring transition-colors"
              >
                Game Page
              </Link>
            )}

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
