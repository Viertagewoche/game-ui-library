import { supabase } from '../lib/supabase'
import Link from 'next/link'
import GameCard from '../components/GameCard'

export const revalidate = 600 // Revalidate every 10 minutes

export default async function Home() {
  // Fetch games with stats
  const { data: games } = await supabase
    .from('games_with_stats')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch recent screenshots with game info
  const { data: screenshots } = await supabase
    .from('screenshots')
    .select(`
      title,
      slug,
      thumbnail_url,
      image_url,
      game_id,
      games (name, slug)
    `)
    .order('created_at', { ascending: false })
    .limit(8)

  // Fetch genre counts
  const { data: genres } = await supabase
    .from('genres_with_counts')
    .select('*')
    .gt('game_count', 0)
    .order('game_count', { ascending: false })

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        {games && games[0]?.hero_image_url && (
          <img
            src={games[0].hero_image_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />

        {/* Content */}
        <div className="relative text-center z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-foreground">
            Game UI Library
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            A curated collection of video game interfaces for designers and game lovers
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/screenshots"
              className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-none hover:bg-primary/90 transition-colors"
            >
              Browse Screenshots
            </Link>
            <Link
              href="/games"
              className="px-6 py-3 border border-border text-foreground font-semibold rounded-none hover:border-ring transition-colors"
            >
              View Games
            </Link>
          </div>
        </div>
      </section>

      {/* ── GENRES ── */}
      {genres && genres.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">Genres</h2>
            <Link href="/games" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              All Genres →
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {genres.map((genre: any) => (
              <Link
                key={genre.slug}
                href={`/games?genre=${genre.slug}`}
                className="shrink-0 bg-card border border-border hover:border-ring rounded-none p-5 min-w-[180px] transition-colors"
              >
                <h3 className="font-semibold text-card-foreground">{genre.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{genre.game_count} games</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── RECENT GAMES ── */}
      {games && games.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">Recent Games</h2>
            <Link href="/games" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              All Games →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {games.map((game: any) => (
              <GameCard
                key={game.slug}
                name={game.name}
                slug={game.slug}
                cover_image_url={game.cover_image_url}
                genre_names={game.genre_names}
                screenshot_count={game.screenshot_count}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── RECENT SCREENSHOTS ── */}
      {screenshots && screenshots.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">Recent Screenshots</h2>
            <Link href="/screenshots" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              All Screenshots →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {screenshots.map((s: any) => (
              <Link key={s.slug} href="/screenshots" className="group">
                <div className="aspect-video rounded-none overflow-hidden bg-card border border-border hover:border-ring transition-colors">
                  <img
                    src={s.thumbnail_url || s.image_url}
                    alt={s.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">{s.title}</p>
                <p className="text-xs text-muted-foreground/60">{(s.games as any)?.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
