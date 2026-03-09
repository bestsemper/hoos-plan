'use client'

import { useState, useEffect } from 'react'

type Course = {
  id: string
  mnemonic: string
  number: string
  title: string
}

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/courses${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`)
        if (res.ok) {
          const data = await res.json()
          setCourses(data)
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error)
      } finally {
        setLoading(false)
      }
    }

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchCourses()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Plan Your Future</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Course Search</h2>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Search for a course (e.g., CS 1110)" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow">
              Loading courses...
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center text-gray-500 py-12 bg-white rounded-lg shadow">
              No courses found matching &quot;{searchQuery}&quot;.
            </div>
          ) : (
            courses.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {course.mnemonic} {course.number}
                    </h3>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
