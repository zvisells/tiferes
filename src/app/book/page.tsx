import Link from 'next/link';

export default function BookPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 max-w-2xl mx-auto py-8">
      {/* Title */}
      <h1 className="text-4xl font-bold text-custom-accent">Buy Our Books</h1>

      {/* Content */}
      <div className="flex flex-col gap-6 text-gray-700">
        <p className="text-lg leading-relaxed">
          Explore our collection of published works featuring compilations of Torah
          teachings and insights. Our books are available in both print and digital formats.
        </p>

        <div className="bg-gray-50 p-6 rounded-2xl flex flex-col gap-4">
          <p className="font-semibold text-custom-accent">
            Available now
          </p>
          <Link href="/book/shop" className="btn-primary inline-block text-center">
            Browse Books
          </Link>
        </div>

        <p className="text-sm text-gray-600 text-center">
          Thank you for supporting our publications
        </p>
      </div>
    </div>
  );
}

