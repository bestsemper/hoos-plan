import Link from 'next/link';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-2 text-heading">Welcome to Hoos Plan</h1>
      <p className="text-text-secondary mb-10">
        Your companion for 4-year course planning at UVA.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-panel-bg p-6 rounded-lg shadow-md border border-panel-border">
          <h2 className="text-2xl font-semibold mb-3 text-heading">Your Plan</h2>
          <p className="text-text-secondary mb-6">
            You haven't generated a plan yet. Keep your academic journey on track!
          </p>
          <Link href="/plan" className="inline-block bg-uva-blue text-white px-5 py-2.5 rounded font-medium hover:bg-uva-blue-dark transition-colors w-fit">
            Build Your Plan
          </Link>
        </div>

        <div className="bg-panel-bg p-6 rounded-lg shadow-md border border-panel-border flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-semibold mb-3 text-heading">Recent Forum Activity</h2>
            <p className="text-text-secondary mb-6">
              See what other students are planning and get feedback on your schedule.
            </p>
          </div>
          <Link href="/forum" className="text-uva-orange font-semibold hover:underline flex items-center">
            Browse the Forum <span className="ml-2">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
