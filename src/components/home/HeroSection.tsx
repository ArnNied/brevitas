'use client';

import NexusCreate from '@/components/nexus/NexusCreate';

export default function HomeHeroSection(): JSX.Element {
  return (
    <section className='space-y-4 container mt-12'>
      <header className='grid justify-center space-y-2 text-center'>
        <h2 className='font-bold text-3xl md:text-5xl'>
          Make every <span className='text-gradient'>connection</span> count
        </h2>
        <p className='max-w-prose text-gray-700 md:text-lg text-center'>
          Create short links, QR Codes, and Link-in-bio pages. Share them
          anywhere. Track what&apos;s working, and what&apos;s not. All inside
          the{' '}
          <strong className='text-text'>Brevitas Connections Platform</strong>.
        </p>
      </header>
      <NexusCreate />
    </section>
  );
}
