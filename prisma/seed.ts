import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')
  
  // Example: Add a dummy course
  const course = await prisma.course.upsert({
    where: {
      mnemonic_number: {
        mnemonic: 'CS',
        number: '1110',
      },
    },
    update: {},
    create: {
      mnemonic: 'CS',
      number: '1110',
      title: 'Introduction to Programming',
      credits: 3,
      reviews: {
        create: [
          {
            rating: 4.5,
            difficulty: 3.0,
            instructor: 'Nadia',
            comment: 'Great intro class!',
          },
          {
            rating: 4.0,
            difficulty: 3.5,
            instructor: 'McBurney',
            comment: 'Good class, but lots of work.',
          },
        ],
      },
    },
  })

  console.log(`Created course with id: ${course.id}`)
  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
