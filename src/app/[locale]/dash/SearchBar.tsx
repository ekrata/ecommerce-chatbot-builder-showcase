'use client';

import React, { useState } from 'react';
import { HiOutlineSearch } from 'react-icons/hi';

export default function SearchBar() {
  // const currentSearchTerm = useDashStore((state) => state.currentSearchTerm);
  const [searchTerm, setSearchTerm] = useState('');
  const onChange = ({ target }: React.ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(target.value);
  // const setCurrentSearchTerm = useDashStore((state) => setCurrentSearchTerm)

  return (
    <div
      id='dash-nav-bar'
      className='btm-nav btm-nav-xs lg:left-0 z-0 flex lg:h-screen border-t-2 px-1 py-1  dark:bg-gray-800 lg:border-r-2 border-black/50'
      aria-label='Sidebar'
    >
      <div className='relative flex w-full max-w-[24rem]'>
        <input
          type='text'
          placeholder='Type here'
          value={searchTerm}
          onChange={onChange}
          className='input input-bordered input-primary w-full max-w-xs'
        />
        <button
          type='submit'
          className='btn btn-outline !absolute right-1 top-1 rounded'
        >
          <HiOutlineSearch />
        </button>
      </div>
    </div>
  );
}
