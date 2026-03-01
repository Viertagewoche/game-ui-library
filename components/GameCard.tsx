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
      <div className="bg-card rounded-none overflow-hidden border border-border hover:border-ring transition-all duration-300">
        {/* Cover Image */}
        <div className="aspect-[3/4] relative overflow-hidden">
          {cover_image_url ? (
            <img
              src={cover_image_url}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-4xl">G</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-card-foreground text-lg leading-tight mb-2">{name}</h3>
          
          {/* Genre Tags */}
          {genre_names && genre_names.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {genre_names.map((genre) => (
                <span
                  key={genre}
                  className="text-xs px-2 py-0.5 rounded-none border border-border text-muted-foreground"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Screenshot Count */}
          {screenshot_count !== undefined && (
            <p className="text-xs text-muted-foreground">{screenshot_count} screenshots</p>
          )}
        </div>
      </div>
    </Link>
  )
}
