'use-client';

import { Link } from 'next-intl';
import Image, { StaticImageData } from 'next/image';
import { useState, FC } from 'react';
import { HiOutlineChevronDown } from 'react-icons/hi2';

export type MenuItemData = {
  title: string;
  description: string;
  route: string;
  icon: JSX.Element;
};

interface Props {
  navTitle: string;
  menuItems: { [key: string]: MenuItemData[] };
}

const renderItems = ({ navTitle, menuItems }: Props) => (
  <>
    {Object.entries(menuItems).map(([key, items]) => (
      <li
        key={key}
        className='flex-col flex gap-y-2  gap-x-4 pl-2 font-light text-black dark:text-white'
      >
        <h5 className='ml-2 font-normal'>{key}</h5>
        <ul className='menu bg-base-100'>
          {items?.map(({ title, description, route, icon }) => (
            <li key={title}>
              <Link href={{ pathname: route }} key={title}>
                <h6 className='place-items-center flex gap-x-2 text-primary font-light'>
                  <>{icon}</>
                  {title}
                </h6>
                <p className='font-normal'>{description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </li>
    ))}
  </>
);

export const MegaMenu: FC<
  Props & { navIcon: JSX.Element; dropdownImage: StaticImageData }
> = ({ navTitle, navIcon, menuItems, dropdownImage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <form>
      <div className='dropdown dropdown-end'>
        <button
          type='button'
          className='flex place-items-center'
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <>{navIcon}</>
          {navTitle}
          <HiOutlineChevronDown
            strokeWidth={2}
            className={`h-3 w-3 transition-transform ${
              isMenuOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        <div className='menu dropdown-content lg:w-2/3 xl:w-1/3 grid-cols-10 gap-3 overflow-visible lg:grid fade-out duration-500 shadow-2xl mx-auto"'>
          <div className='col-span-3 grid place-items-center rounded-md shadow-md mx-auto'>
            <Image
              width={200}
              height={200}
              src={dropdownImage}
              alt='Dropdown Image'
              className='rounded-md'
            />
          </div>
          <ul className='col-span-7 flex w-full gap-1'>
            {renderItems({ navTitle, menuItems })}
          </ul>
        </div>
      </div>
    </form>
  );
};
