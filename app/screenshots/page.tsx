import { supabase } from '../../lib/supabase'
import ScreenshotsClient from './ScreenshotsClient'

export const revalidate = 600

export default async function ScreenshotsPage() {
  // Fetch all screenshots with game info and elements
  const { data: screenshots } = await supabase
    .from('screenshots')
    .select(`
      id, title, slug, image_url, thumbnail_url, media_type,
      games (name, slug),
      screenshot_elements (
        element_id,
        elements (name, slug, group_name, sort_order)
      )
    `)
    .order('created_at', { ascending: false })

  // Transform data
  const screenshotsTransformed = screenshots?.map((s: any) => ({
    ...s,
    game_name: s.games?.name,
    game_slug: s.games?.slug,
    element_names: s.screenshot_elements?.map((se: any) => se.elements?.name).filter(Boolean) || [],
    element_slugs: s.screenshot_elements?.map((se: any) => se.elements?.slug).filter(Boolean) || [],
  })) || []

  // Fetch elements with counts, grouped
  const { data: elements } = await supabase
    .from('elements_with_counts')
    .select('*')
    .gt('screenshot_count', 0)

  // Group elements by group_name
  const groupMap = new Map<string, { slug: string; name: string; count: number }[]>()
  elements?.forEach((el: any) => {
    const group = groupMap.get(el.group_name) || []
    group.push({ slug: el.slug, name: el.name, count: el.screenshot_count })
    groupMap.set(el.group_name, group)
  })

  const filterGroups = Array.from(groupMap.entries()).map(([group_name, items]) => ({
    group_name,
    items,
  }))

  return (
    <ScreenshotsClient
      screenshots={screenshotsTransformed}
      filterGroups={filterGroups}
      totalCount={screenshotsTransformed.length}
    />
  )
}