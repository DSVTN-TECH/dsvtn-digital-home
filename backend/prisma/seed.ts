import { PrismaClient, Role, UserStatus } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const IDS = {
  admin: '00000000-0000-0000-0000-000000000001',
  member1: '00000000-0000-0000-0000-000000000002',
  member2: '00000000-0000-0000-0000-000000000003',
  logistic: '00000000-0000-0000-0000-000000000004',
  activityOpen: '00000000-0000-0000-0000-000000000101',
  activityDraft: '00000000-0000-0000-0000-000000000102',
  task1: '00000000-0000-0000-0000-000000000111',
  task2: '00000000-0000-0000-0000-000000000112',
  task3: '00000000-0000-0000-0000-000000000113',
  productPolo: '00000000-0000-0000-0000-0000000000a1',
  productCap: '00000000-0000-0000-0000-0000000000a2',
  productTote: '00000000-0000-0000-0000-0000000000a3',
  article1: '00000000-0000-0000-0000-000000000401',
  article2: '00000000-0000-0000-0000-000000000402',
  article3: '00000000-0000-0000-0000-000000000404',
  campaign: '00000000-0000-0000-0000-000000000501',
  album: '00000000-0000-0000-0000-000000000601',
  appPending: '00000000-0000-0000-0000-000000000701',
  appApproved: '00000000-0000-0000-0000-000000000702',
} as const

let adminId: string = IDS.admin

async function seedUsers() {
  const [adminHash, m1Hash, m2Hash, logiHash] = await Promise.all([
    bcrypt.hash('changeme', 12),
    bcrypt.hash('member1', 12),
    bcrypt.hash('member2', 12),
    bcrypt.hash('logistic1', 12),
  ])

  const users = [
    { id: IDS.admin, fullName: 'Admin ĐSVTN', email: 'admin@dsvtn.vn', passwordHash: adminHash, role: Role.ADMIN },
    { id: IDS.member1, fullName: 'Nguyễn Thành Viên', email: 'member1@dsvtn.vn', passwordHash: m1Hash, role: Role.MEMBER },
    { id: IDS.member2, fullName: 'Trần Tình Nguyện', email: 'member2@dsvtn.vn', passwordHash: m2Hash, role: Role.MEMBER },
    { id: IDS.logistic, fullName: 'Lê Hậu Cần', email: 'logistic@dsvtn.vn', passwordHash: logiHash, role: Role.LOGISTIC },
  ]

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { fullName: u.fullName, role: u.role, status: UserStatus.ACTIVE, mustChangePassword: false },
      create: { ...u, mustChangePassword: false, status: UserStatus.ACTIVE },
    })
  }
  adminId = (await prisma.user.findUniqueOrThrow({ where: { email: 'admin@dsvtn.vn' } })).id
  console.log('✅ Users seeded (admin/member1/member2/logistic)')
}

async function seedVolunteerApplications() {
  await prisma.volunteerApplication.upsert({
    where: { id: IDS.appPending },
    update: {},
    create: {
      id: IDS.appPending,
      fullName: 'Phạm Ứng Viên',
      email: 'pham.ungvien@example.com',
      phone: '0908123456',
      studentId: '21520001',
      note: 'Mong muốn tham gia mảng truyền thông.',
      status: 'PENDING',
    },
  })

  await prisma.volunteerApplication.upsert({
    where: { id: IDS.appApproved },
    update: {},
    create: {
      id: IDS.appApproved,
      fullName: 'Đỗ Đã Duyệt',
      email: 'do.daduyet@example.com',
      phone: '0908234567',
      studentId: '21520002',
      note: 'Đã từng tham gia Mùa Hè Xanh.',
      status: 'APPROVED',
      reviewedById: adminId,
      reviewedAt: new Date('2026-05-20T08:00:00.000Z'),
    },
  })
  console.log('✅ Volunteer applications seeded (1 PENDING + 1 APPROVED)')
}

async function seedActivitiesAndTasks() {
  await prisma.activity.upsert({
    where: { id: IDS.activityOpen },
    update: {},
    create: {
      id: IDS.activityOpen,
      title: 'Mùa Hè Xanh 2026 — Đồng Tháp',
      description: 'Sửa sân chơi, mở lớp ôn tập và tổ chức gian hàng gây quỹ cho học sinh vùng sâu.',
      startTime: new Date('2026-07-01T07:00:00.000Z'),
      endTime: new Date('2026-07-30T17:00:00.000Z'),
      status: 'OPEN',
      createdById: adminId,
    },
  })

  await prisma.activity.upsert({
    where: { id: IDS.activityDraft },
    update: {},
    create: {
      id: IDS.activityDraft,
      title: 'Trung Thu Cho Em 2026',
      description: 'Chuẩn bị quà và chương trình văn nghệ Trung Thu cho trẻ em.',
      startTime: new Date('2026-09-10T08:00:00.000Z'),
      endTime: new Date('2026-09-15T20:00:00.000Z'),
      status: 'DRAFT',
      createdById: adminId,
    },
  })

  const tasks = [
    { id: IDS.task1, name: 'Hậu cần & vật tư', description: 'Chuẩn bị, kiểm kê và vận chuyển vật tư.', slotCount: 2, priority: 1 },
    { id: IDS.task2, name: 'Lớp học ôn tập', description: 'Phụ trách đứng lớp và kèm học sinh.', slotCount: 3, priority: 2 },
    { id: IDS.task3, name: 'Truyền thông & ghi hình', description: 'Chụp ảnh, viết bài và cập nhật mạng xã hội.', slotCount: 2, priority: 0 },
  ]
  for (const t of tasks) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: {},
      create: { ...t, activityId: IDS.activityOpen },
    })
  }
  console.log('✅ Activities (1 OPEN + 1 DRAFT) and 3 tasks seeded')
}

async function seedArticles() {
  const articles = [
    {
      id: IDS.article1,
      title: 'Mùa Hè Xanh 2026: Những nhịp cầu nối bờ vui',
      slug: 'mua-he-xanh-2026-nhung-nhip-cau-noi-bo-vui',
      content: '## Những nhịp cầu nối bờ vui\n\nTrong 30 ngày tại Đồng Tháp, đội hình ĐSVTN phối hợp cùng địa phương sửa sân chơi, mở lớp ôn tập và tổ chức gian hàng gây quỹ nhỏ cho học sinh.\n\n- 120 phần quà học tập được trao tận tay.\n- 18 tình nguyện viên trực tiếp tham gia.\n- 4 điểm sinh hoạt cộng đồng được dọn dẹp và sơn mới.',
      status: 'PUBLISHED' as const,
    },
    {
      id: IDS.article2,
      title: 'ĐSVTN mở đợt tuyển thành viên logistics',
      slug: 'dsvtn-mo-dot-tuyen-thanh-vien-logistics',
      content: '## Logistics cần người kỹ tính\n\nBan logistics phụ trách chuẩn bị vật tư, điều phối giao nhận và theo dõi đơn hàng gây quỹ. Đợt tuyển ưu tiên các bạn có thể tham gia cuối tuần và quen làm việc theo checklist.',
      status: 'PUBLISHED' as const,
    },
    {
      id: IDS.article3,
      title: 'Bản nháp kế hoạch truyền thông tháng 6',
      slug: 'ban-nhap-ke-hoach-truyen-thong-thang-6',
      content: 'Nội dung đang biên tập.',
      status: 'DRAFT' as const,
    },
  ]
  for (const a of articles) {
    await prisma.article.upsert({
      where: { id: a.id },
      update: {},
      create: { ...a, authorId: adminId },
    })
  }
  console.log('✅ Articles seeded (2 PUBLISHED + 1 DRAFT)')
}

async function seedProducts() {
  const products = [
    { id: IDS.productPolo, name: 'Áo polo SVTN 2026', description: 'Áo polo cotton, in logo SVTN, các size S/M/L/XL.', priceCents: 18000000, imageUrl: '/assets/products/polo.svg' },
    { id: IDS.productCap, name: 'Mũ lưỡi trai SVTN', description: 'Mũ vải, thêu logo SVTN.', priceCents: 9000000, imageUrl: '/assets/products/cap.svg' },
    { id: IDS.productTote, name: 'Túi vải tote', description: 'Túi tote canvas, in slogan tình nguyện.', priceCents: 6500000, imageUrl: '/assets/products/tote.svg' },
  ]
  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: { imageUrl: p.imageUrl },
      create: { ...p, status: 'ACTIVE' },
    })
  }
  console.log('✅ Products seeded (3 ACTIVE)')
}

async function seedCampaign() {
  await prisma.campaign.upsert({
    where: { id: IDS.campaign },
    update: {},
    create: {
      id: IDS.campaign,
      title: 'Áo polo gây quỹ Mùa Hè Xanh 2026',
      description: 'Toàn bộ lợi nhuận dành cho quỹ học bổng học sinh vùng sâu.',
      coverImageUrl: '/assets/campaigns/polo-fund.svg',
      goalCents: 20000000,
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-07-31'),
      status: 'ACTIVE',
    },
  })
  console.log('✅ Campaign seeded (1 ACTIVE)')
}

async function seedBadges() {
  const badges = [
    { code: 'FIRST_ACTIVITY', name: 'Hoạt động đầu tiên', description: 'Hoàn thành hoạt động tình nguyện đầu tiên.', criteriaType: 'ACTIVITY_COUNT', criteriaThreshold: 1 },
    { code: 'FIVE_ACTIVITIES', name: 'Năm hoạt động', description: 'Hoàn thành 5 hoạt động tình nguyện.', criteriaType: 'ACTIVITY_COUNT', criteriaThreshold: 5 },
    { code: 'FUNDRAISER', name: 'Nhà gây quỹ', description: 'Đóng góp vào chiến dịch gây quỹ.', criteriaType: 'FUNDRAISING', criteriaThreshold: 1 },
  ]
  for (const b of badges) {
    await prisma.badge.upsert({
      where: { code: b.code },
      update: {},
      create: { ...b, iconUrl: `/assets/badges/${b.code.toLowerCase()}.svg` },
    })
  }
  console.log('✅ Badges seeded (3)')
}

async function seedGallery() {
  await prisma.galleryAlbum.upsert({
    where: { id: IDS.album },
    update: {},
    create: {
      id: IDS.album,
      title: 'Recap Mùa Hè Xanh 2026',
      description: 'Những khoảnh khắc đáng nhớ tại Đồng Tháp.',
      coverImageUrl: '/assets/gallery/mhx-cover.svg',
      activityId: IDS.activityOpen,
      createdById: adminId,
      photos: {
        create: [
          { imageUrl: '/assets/gallery/mhx-1.svg', caption: 'Sửa sân chơi cho các em.', sortOrder: 0 },
          { imageUrl: '/assets/gallery/mhx-2.svg', caption: 'Lớp ôn tập buổi tối.', sortOrder: 1 },
          { imageUrl: '/assets/gallery/mhx-3.svg', caption: 'Gian hàng gây quỹ.', sortOrder: 2 },
        ],
      },
    },
  })
  console.log('✅ Gallery album seeded (1 album + 3 photos)')
}

async function main() {
  await seedUsers()
  await seedVolunteerApplications()
  await seedActivitiesAndTasks()
  await seedArticles()
  await seedProducts()
  await seedCampaign()
  await seedBadges()
  await seedGallery()
  console.log('\n🌱 Seed complete. Default accounts:')
  console.log('   admin@dsvtn.vn / changeme  (ADMIN)')
  console.log('   member1@dsvtn.vn / member1  (MEMBER)')
  console.log('   member2@dsvtn.vn / member2  (MEMBER)')
  console.log('   logistic@dsvtn.vn / logistic1  (LOGISTIC)')
  console.log('   ⚠ Local-only passwords. Never reuse in staging/production.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
