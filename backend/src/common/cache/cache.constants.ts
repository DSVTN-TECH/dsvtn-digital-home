export const CACHE_KEY = {
  articlesPublished: (page: number, pageSize: number) =>
    `cache:articles:published:${page}:${pageSize}`,
  articlesPublishedPrefix: () => `cache:articles:published:`,
  productsActive: (page: number, pageSize: number) => `cache:products:active:${page}:${pageSize}`,
  productsActivePrefix: () => `cache:products:active:`,
  campaignPublic: (campaignId: string) => `cache:campaigns:public:${campaignId}`,
  campaignPublicPrefix: () => `cache:campaigns:public:`,
  reportsDashboard: () => `cache:reports:dashboard`,
  reportsOverview: (key: string) => `cache:reports:overview:${key}`,
  reportsOverviewPrefix: () => `cache:reports:overview:`,
  galleryAlbums: () => `cache:gallery:albums`,
  galleryAlbum: (albumId: string) => `cache:gallery:album:${albumId}`,
} as const
