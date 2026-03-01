'use client'

import { useState } from 'react'

interface FilterItem {
  slug: string
  name: string
  count: number
}

interface FilterGroup {
  group_name: string
  items: FilterItem[]
}

interface FilterSidebarProps {
  groups: FilterGroup[]
  activeFilters: string[]
  onFilterChange: (slug: string) => void
  onClearAll: () => void
}

function AccordionGroup({
  group_name,
  items,
  activeFilters,
  onFilterChange,
  defaultOpen = false,
}: {
  group_name: string
  items: FilterItem[]
  activeFilters: string[]
  onFilterChange: (slug: string) => void
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const activeCount = items.filter((item) =>
    activeFilters.includes(item.slug)
  ).length

  return (
    <div className="border-b border-zinc-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 px-1 text-left hover:text-white transition-colors"
      >
        <span className="text-xs uppercase tracking-widest font-semibold text-zinc-300">
          {group_name}
          {activeCount > 0 && (
            <span className="ml-2 text-white bg-zinc-700 px-1.5 py-0.5 rounded text-[10px]">
              {activeCount}
            </span>
          )}
        </span>
        <span className="text-zinc-500 text-lg">
          {isOpen ? '−' : '+'}
        </span>
      </button>

      {isOpen && (
        <div className="pb-4 space-y-1">
          {items.map((item) => {
            const isActive = activeFilters.includes(item.slug)
            return (
              <button
                key={item.slug}
                onClick={() => onFilterChange(item.slug)}
                className={`w-full flex items-center justify-between px-1 py-1.5 rounded text-sm transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {/* Checkbox */}
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-white border-white'
                        : 'border-zinc-600'
                    }`}
                  >
                    {isActive && (
                      <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span>{item.name}</span>
                </div>
                <span className="text-zinc-600 text-xs tabular-nums">{item.count}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function FilterSidebar({
  groups,
  activeFilters,
  onFilterChange,
  onClearAll,
}: FilterSidebarProps) {
  return (
    <aside className="w-64 shrink-0">
      <div className="sticky top-24">
        {/* Header */}
        {activeFilters.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-zinc-400">
              {activeFilters.length} filter{activeFilters.length > 1 ? 's' : ''} active
            </span>
            <button
              onClick={onClearAll}
              className="text-xs text-zinc-500 hover:text-white transition-colors underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Filter Groups */}
        {groups.map((group, index) => (
          <AccordionGroup
            key={group.group_name}
            group_name={group.group_name}
            items={group.items}
            activeFilters={activeFilters}
            onFilterChange={onFilterChange}
            defaultOpen={index === 0}
          />
        ))}
      </div>
    </aside>
  )
}