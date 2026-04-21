function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          React + TypeScript + Tailwind CSS
        </h1>
        <p className="text-gray-600 text-lg">
          Vite-powered React project with Tailwind CSS v4.
        </p>
        <div className="mt-6">
          <a
            href="https://tailwindcss.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors"
          >
            Explore Tailwind Docs
          </a>
        </div>
      </div>
    </div>
  )
}

export default App
