import Link from 'next/link';

type NavbarButtonProps = {
  href: string;
  text: string;
};

export default function NavbarButton({
  href,
  text,
}: NavbarButtonProps): JSX.Element {
  return (
    <Link
      href={href}
      className='block lg:inline-block mt-4 lg:mt-0 text-light hover:text-gray-300 active:text-gray-400 text-right tracking-[0.2em] transition-colors duration-75'
    >
      {text}
    </Link>
  );
}
