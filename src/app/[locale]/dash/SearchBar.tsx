'use client';

import React, { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { HiOutlineSearch } from 'react-icons/hi';

export default function SearchBar() {
  // const currentSearchTerm = useDashStore((state) => state.currentSearchTerm);
  const [searchTerm, setSearchTerm] = useState('');
  const onChange = ({ target }: React.ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(target.value);
  // const setCurrentSearchTerm = useDashStore((state) => setCurrentSearchTerm)

  return (
    <div className='form-control'>
      <div className='input-group input-group-sm'>
        <input
          type='text'
          placeholder='Search…'
          className='input input-bordered input-sm'
        />
        <button
          type='submit'
          className='btn btn-square btn-sm focus:ring-black'
        >
          <FaSearch />
        </button>
      </div>
    </div>
  );
}
