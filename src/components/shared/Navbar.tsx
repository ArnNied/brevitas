import Link from 'next/link';

import NavbarLogin from './NavbarLogin';

export default function SharedNavbar(): JSX.Element {
  return (
    <>
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
            <NavbarLogin />
          </div>
        </div>
      </header>
    </>
  );
}
