'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
// import { MegaMenu, MenuItemData } from '../MegaMenu';
import logoImage from '../../../../public/logo.png';
import SearchBar from './SearchBar';

// nav list component

export default function DashNavbar() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const t = useTranslations('navbar');
  const toggleIsNavOpen = () => setIsNavOpen((cur) => !cur);

  useEffect(() => {
    window.addEventListener(
      'resize',
      () => window.innerWidth >= 960 && setIsNavOpen(false)
    );
  }, []);

  return (
    <div className='navbar bg-base-100 relative lg:grid-cols-12 flex items-center text-black'>
      <div className='col-span-1'>
        <Image
          src={logoImage}
          alt='Logo'
          className='h-12 w-12 p-1  bg-[conic-gradient(at_left,_var(--tw-gradient-stops))] from-yellow-500 via-purple-500 to-blue-500 rounded-2xl shadow-2xl'
        />
      </div>

      <div className='col-span-3'>
        <SearchBar />
      </div>
      <div className='col-span-4'>
        <div />
      </div>
      <div className='col-span-4' />
    </div>
  );
}
