'use client';

import { Typography } from '../../mt-components';

export default function Footer() {
  return (
    <footer className='w-full bg-white p-8'>
      <div className='flex flex-row flex-wrap items-center justify-center gap-y-6 gap-x-12 bg-white text-center md:justify-between'>
        <ul className='flex flex-wrap items-center gap-y-2 gap-x-8'>
          <li />
        </ul>
      </div>
      <hr className='my-8 border-blue-gray-50' />
      &copy; 2023 Material Tailwind
    </footer>
  );
}
