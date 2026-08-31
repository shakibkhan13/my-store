export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50">
      <section className="w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-4 inline-block rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
            Welcome
          </span>

          <h1 className="text-4xl font-bold trackiang-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Build something amazing
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
            A modern, scalable and clean Next.js frontend structure ready for
            your application.
          </p>
        </div>
      </section>
    </main>
  );
}