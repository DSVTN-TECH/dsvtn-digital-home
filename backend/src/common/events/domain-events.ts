export const DomainEvents = {
  volunteerReviewed: 'volunteer.reviewed',
  matcherRun: 'matcher.run',
  assignmentOverride: 'assignment.override',
  orderStatusChanged: 'order.status-changed',
  articlePublished: 'article.published',
  badgeUnlocked: 'badge.unlocked',
} as const

export interface NotificationEventPayload {
  userId?: string
  userIds?: string[]
  title: string
  body: string
  linkUrl?: string
}
