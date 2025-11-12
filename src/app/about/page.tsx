import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-6 max-w-4xl mx-auto py-8">
      {/* Title */}
      <h1 className="text-4xl font-bold text-custom-accent">About Tiferes L'Moshe</h1>

      {/* Content */}
      <div className="flex flex-col gap-6 text-gray-700 leading-relaxed">
        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold text-custom-accent">Our Shul</h2>
          <p>
            Tiferes L'Moshe is a traditional Jewish community dedicated to the study and
            practice of Torah. Our members come from diverse backgrounds and are united by
            a shared commitment to learning, spiritual growth, and community service.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold text-custom-accent">Our Mission</h2>
          <p>
            We believe in making Torah teachings accessible to all. Through our regular
            discourses and online archive, we aim to inspire, educate, and strengthen the
            Jewish community worldwide.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold text-custom-accent">About the Speaker</h2>
          <p>
            Our primary speaker brings decades of Torah scholarship and teaching experience
            to every discourse. With a deep knowledge of Jewish texts and traditions, they
            guide us through meaningful explorations of our heritage.
          </p>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold text-custom-accent">Our Community</h2>
          <p>
            Whether you're a longtime member or just discovering our community, we welcome
            you to join us. Participate in our regular classes, attend services, or simply
            explore our audio archive at your own pace.
          </p>
        </section>
      </div>

      {/* Donate Button */}
      <a
        href="https://abcharity.org/MTL/25"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary flex flex-row items-center justify-center gap-2 w-full md:w-fit"
      >
        <Heart size={20} />
        Support Our Shul
      </a>
    </div>
  );
}

