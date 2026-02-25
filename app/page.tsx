import { prisma } from '@/lib/prisma'

export default async function Home() {
  // Fetch courses from the database
  const courses = await prisma.course.findMany({
    include: {
      reviews: true,
    },
  })

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Plan Your Future</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Course Search</h2>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Search for a course (e.g., CS 1010)" 
              className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Search
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          {courses.length === 0 ? (
            <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow">
              No courses found in the database. Add some to get started!
            </div>
          ) : (
            courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {course.mnemonic} {course.number}
                    </h3>
                    <p className="text-gray-600 mt-1">{course.title}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Credits</div>
                    <div className="font-semibold text-gray-900">{course.credits || 'N/A'}</div>
                  </div>
                </div>
                
                {course.reviews.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Reviews</h4>
                    <div className="flex gap-4 text-sm">
                      <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                        Rating: {(course.reviews.reduce((acc, rev) => acc + rev.rating, 0) / course.reviews.length).toFixed(2)}/5
                      </div>
                      <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full">
                        Difficulty: {(course.reviews.reduce((acc, rev) => acc + rev.difficulty, 0) / course.reviews.length).toFixed(2)}/5
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
