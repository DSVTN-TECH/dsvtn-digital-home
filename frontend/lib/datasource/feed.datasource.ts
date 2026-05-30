export interface FeedItem {
  id: string
  type: 'notification' | 'article' | 'activity'
  title: string
  description: string | null
  href: string
  createdAt: string
}

export interface FeedDataSource {
  list(): Promise<FeedItem[]>
}
