'use client';

import Link from 'next/link';

import { useAuthContext } from '../context/AuthContextProvider';

import NavbarDashboardTemporary from './NavbarDashboardTemporary';
import NavbarLoginButton from './NavbarLoginButton';

export default function Navbar(): JSX.Element {
  const { authUser } = useAuthContext();

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
            {authUser ? <NavbarDashboardTemporary /> : <NavbarLoginButton />}
          </div>
        </div>
      </header>
    </>
  );
}
