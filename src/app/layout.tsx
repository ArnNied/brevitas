import './globals.scss';

import SharedNavbar from '@/components/shared/Navbar';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang='en'>
      <body className='bg-background-base text-text-base antialiased'>
        <SharedNavbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
