'use client';

import Link from 'next/link';

export default function SharedNavbar(): JSX.Element {
  return (
    <header className='w-full'>
      <div className='flex flex-row justify-between py-6 container'>
        <div className='flex flex-row items-center space-x-8'>
          <Link
            href='/'
            className='font-bold text-2xl text-gradient tracking-wide'
          >
            BREVITAS
          </Link>
        </div>
        <div className='flex items-center'>
          <Link
            href='/login'
            className='px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded transition-colors'
          >
            Login / Register
          </Link>
        </div>
      </div>
    </header>
  );
}
