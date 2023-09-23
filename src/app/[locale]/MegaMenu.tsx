'use-client';

import { Link } from 'next-intl';
import Image, { StaticImageData } from 'next/image';
import { FC, useState } from 'react';
import { FaFacebookMessenger, FaInstagram, FaMailBulk } from 'react-icons/fa';
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
      <div key={key} className='flex pl-4 divide-x-2 lg:flex-col'>
        <h3 className='text-2xl'>{key}</h3>
        <ul className='mt-4 space-y-4 no-underline menu menu-compact bg-base-100'>
          {items?.map(({ title, description, route, icon }) => (
            <li key={title} className='flex-col block p-0'>
              <div>
                <Link href={{ pathname: route }} key={title}>
                  <h6 className='flex text-lg place-items-center gap-x-2 text-primary'>
                    <>{icon}</>
                    {title}
                    {title === 'Multichannel' && (
                      <>
                        <FaFacebookMessenger />
                        <FaInstagram />
                        <FaMailBulk />
                      </>
                    )}
                  </h6>
                  <p className='flex text-sm font-normal'>{description}</p>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </>
);

export const MegaMenu: FC<
  Props & { navIcon: JSX.Element; dropdownImage: StaticImageData }
> = ({ navTitle, navIcon, menuItems, dropdownImage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className=''>
      <button
        id='dropdownButton'
        type='button'
        data-dropdown-toggle='dropdown'
        className='flex place-items-center gap-x-2'
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <>{navIcon}</>
        {navTitle}
        <HiOutlineChevronDown
          strokeWidth={2}
          className={`h-3 w-3 transition-transform ${isMenuOpen ? 'rotate-180' : ''
            }`}
        />
      </button>
      <div
        id='dropdown'
        aria-labelledby='dropdownButton'
        className={`${isMenuOpen
          ? 'fixed grid grid-cols-10 animate-in fade-in '
          : 'hidden'
          }    -translate-x-1/3 lg:w-1/3 justify-center overflow-hidden  xl:w-2/3 rounded-box  bg-white   duration-200  shadow-2xl p-6`}
      >
        <div className='flex col-span-10 lg:col-span-3 place-items-center '>
          <Image
            src={dropdownImage}
            alt='Dropdown Image'
            className='w-full h-full shadow-md rounded-box'
          />
        </div>
        <div className='flex col-span-10 lg:col-span-7'>
          {renderItems({ navTitle, menuItems })}
        </div>
      </div>
    </div>
  );
};
