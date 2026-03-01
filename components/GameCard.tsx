import Link from 'next/link'

interface GameCardProps {
  name: string
  slug: string
  cover_image_url: string | null
  genre_names?: string[]
  screenshot_count?: number
}

export default function GameCard({ name, slug, cover_image_url, genre_names, screenshot_count }: GameCardProps) {
  return (
    <Link href={`/games/${slug}`} className="group block">
      <div className="bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 hover:border-zinc-600 transition-all duration-300">
        {/* Cover Image */}
        <div className="aspect-[3/4] relative overflow-hidden">
          {cover_image_url ? (
            <img
              src={cover_image_url}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
              <span className="text-zinc-600 text-4xl">🎮</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-white text-lg leading-tight mb-2">{name}</h3>
          
          {/* Genre Tags */}
          {genre_names && genre_names.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {genre_names.map((genre) => (
                <span
                  key={genre}
                  className="text-xs px-2 py-0.5 rounded border border-zinc-700 text-zinc-400"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Screenshot Count */}
          {screenshot_count !== undefined && (
            <p className="text-xs text-zinc-500">{screenshot_count} screenshots</p>
          )}
        </div>
      </div>
    </Link>
  )
}