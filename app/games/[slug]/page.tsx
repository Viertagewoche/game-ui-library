import { supabase } from '../../../lib/supabase'
import { notFound } from 'next/navigation'
import GameDetailClient from './GameDetailClient'

export const revalidate = 600

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // Fetch game
  const { data: game } = await supabase
    .from('games')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!game) notFound()

  // Fetch genres for this game
  const { data: gameGenres } = await supabase
    .from('game_genres')
    .select('genre_id, genres (name, slug)')
    .eq('game_id', game.id)

  // Fetch screenshots with elements
  const { data: screenshots } = await supabase
    .from('screenshots')
    .select(`
      id, title, slug, image_url, thumbnail_url, media_type,
      screenshot_elements (
        element_id,
        elements (name, slug, group_name)
      )
    `)
    .eq('game_id', game.id)
    .order('created_at', { ascending: false })

  // Transform screenshots to include element names
  const screenshotsWithElements = screenshots?.map((s: any) => ({
    ...s,
    element_names: s.screenshot_elements?.map((se: any) => se.elements?.name).filter(Boolean) || [],
    element_slugs: s.screenshot_elements?.map((se: any) => se.elements?.slug).filter(Boolean) || [],
  })) || []

  // Build element filter groups from screenshots
  const elementMap = new Map<string, { name: string; slug: string; group_name: string; count: number }>()
  screenshots?.forEach((s: any) => {
    s.screenshot_elements?.forEach((se: any) => {
      if (se.elements) {
        const existing = elementMap.get(se.elements.slug)
        if (existing) {
          existing.count++
        } else {
          elementMap.set(se.elements.slug, {
            name: se.elements.name,
            slug: se.elements.slug,
            group_name: se.elements.group_name,
            count: 1,
          })
        }
      }
    })
  })

  const genreNames = gameGenres?.map((gg: any) => gg.genres?.name).filter(Boolean) || []

  return (
    <GameDetailClient
      game={game}
      genreNames={genreNames}
      screenshots={screenshotsWithElements}
      elements={Array.from(elementMap.values())}
    />
  )
}