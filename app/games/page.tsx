import { supabase } from '@/lib/supabase'
import GamesClient from './GamesClient'

export const revalidate = 600

export default async function GamesPage() {
  // Fetch all games with stats
  const { data: games } = await supabase
    .from('games_with_stats')
    .select('*')
    .order('name')

  // Fetch genres with counts
  const { data: genres } = await supabase
    .from('genres_with_counts')
    .select('*')
    .order('name')

  return (
    <GamesClient
      games={games || []}
      genres={genres || []}
    />
  )
}