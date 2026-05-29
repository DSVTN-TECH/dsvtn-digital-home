import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('changeme', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@dsvtn.vn' },
    update: {},
    create: {
      fullName: 'Admin ĐSVTN',
      email: 'admin@dsvtn.vn',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  console.log('✅ Seeded admin:', admin.email)
  console.log('   Default password: changeme — ĐỔI NGAY sau khi setup!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
