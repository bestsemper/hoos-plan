import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')

  try {
    if (!query) {
      const courses = await prisma.course.findMany({
        take: 10,
        include: {
          reviews: true,
        },
      })
      return NextResponse.json(courses)
    }

    // Basic search by mnemonic or title
    const courses = await prisma.course.findMany({
      where: {
        OR: [
          {
            mnemonic: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        reviews: true,
      },
      take: 20,
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}
