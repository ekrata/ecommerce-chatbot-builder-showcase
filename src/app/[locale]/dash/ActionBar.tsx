'use client';

import { usePathname } from 'next/navigation';
import { HiOutlineSearch } from 'react-icons/hi';

export const getFeatureName = (pathname: string) =>
  pathname.split('/dash/')[1].split('/')[0];

export default function ActionBar() {
  const path = usePathname();
  const featureName = getFeatureName(path);
  // if (featureName === 'home') {
  //   return
  // }

  return (
    <div className='relative flex w-full max-w-[24rem]'>
      <button
        type='button'
        placeholder='Type here'
        className='input input-bordered input-primary w-full btn-sm'
      >
        Solved
      </button>
      <HiOutlineSearch />
    </div>
  );
}
