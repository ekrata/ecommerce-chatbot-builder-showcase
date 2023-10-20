import Image from 'next/image';
// import { MegaMenu, MenuItemData } from '../MegaMenu';
import logoImage from 'public/logo.png';
import SearchBar from './SearchBar';
import ActionBar from './ActionBar';

// nav list component

export default function DashHeader() {
  return (
    <div className='flex items-center w-screen bg-gray-900'>
      <Image
        src={logoImage}
        alt='Logo'
        className='h-12 w-12 p-1  bg-[conic-gradient(at_left,_var(--tw-gradient-stops))] from-yellow-500 via-purple-500 to-blue-500 shadow-2xl'
      />
      <div className='lg:grid lg:grid-cols-12 lg:space-around'>
        <div className='col-span-4 p-2'>
          <SearchBar />
        </div>
        <div className='col-span-4 p-2'>
          <ActionBar />
        </div>
        <div className='col-span-4 p-2'>
          <div />
        </div>
      </div>
    </div>
  );
}
