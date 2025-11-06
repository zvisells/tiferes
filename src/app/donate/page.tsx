import Link from 'next/link';

export default function DonatePage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 max-w-2xl mx-auto py-8">
      {/* Title */}
      <h1 className="text-4xl font-bold text-custom-accent">Support Our Community</h1>

      {/* Content */}
      <div className="flex flex-col gap-6 text-gray-700">
        <p className="text-lg leading-relaxed">
          Your support helps us continue our mission to share Torah teachings and serve
          the community. Every donation enables us to maintain our programs, hosting, and
          outreach efforts.
        </p>

        <div className="bg-gray-50 p-6 rounded-2xl flex flex-col gap-4">
          <p className="font-semibold text-custom-accent">
            Ready to make a difference?
          </p>
          <Link href="/donate/external" className="btn-primary inline-block text-center">
            Donate Now
          </Link>
        </div>

        <p className="text-sm text-gray-600 text-center">
          Thank you for supporting Tiferes L'Moshe
        </p>
      </div>
    </div>
  );
}

