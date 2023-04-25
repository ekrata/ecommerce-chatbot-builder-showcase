'use-client';

import {
  Menu,
  MenuHandler,
  Typography,
  MenuItem,
  MenuList,
} from '@material-tailwind/react';
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
      <section className='flex-col flex gap-y-2  gap-x-4 pl-2 font-light text-black dark:text-white'>
        <Typography variant='h5' className='ml-2 font-normal'>
          {key}
        </Typography>
        {items?.map(({ title, description, route, icon }) => (
          <Link href={{ pathname: route }} key={title}>
            <MenuItem>
              <Typography
                variant='h6'
                className='place-items-center flex gap-x-2 text-primary font-light'
              >
                <>{icon}</>
                {title}
              </Typography>
              <Typography variant='small' color='gray' className='font-normal'>
                {description}
              </Typography>
            </MenuItem>
          </Link>
        ))}
      </section>
    ))}
  </>
);

export const MegaMenu: FC<
  Props & { navIcon: JSX.Element; dropdownImage: StaticImageData }
> = ({ navTitle, navIcon, menuItems, dropdownImage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const triggers = {
    onMouseEnter: () => setIsMenuOpen(true),
    onMouseLeave: () => setIsMenuOpen(false),
  };

  return (
    <>
      <Menu open={isMenuOpen} handler={setIsMenuOpen}>
        <MenuHandler>
          <Typography as='a' href='#' variant='small' className='font-normal'>
            <MenuItem
              {...triggers}
              className='hidden place-items-center gap-2 text-blue-gray-900 lg:flex lg:rounded-md'
            >
              <>{navIcon}</>
              {navTitle}
              <HiOutlineChevronDown
                strokeWidth={2}
                className={`h-3 w-3 transition-transform ${
                  isMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </MenuItem>
          </Typography>
        </MenuHandler>
        <MenuList
          {...triggers}
          className='hidden  lg:w-ful xl:w-2/3 grid-cols-10 gap-3 overflow-visible lg:grid fade-out duration-500 shadow-2xl mx-auto"'
        >
          <div className='col-span-3 grid place-items-center rounded-md shadow-md mx-auto'>
            <>
              <Image
                src={dropdownImage}
                alt='Dropdown Image'
                className='rounded-md'
              />
            </>
          </div>
          <ul className='col-span-7 flex w-full gap-1'>
            {renderItems({ navTitle, menuItems })}
          </ul>
        </MenuList>
      </Menu>
      <MenuItem className='flex items-center gap-2 text-blue-gray-900 lg:hidden'>
        <>{navIcon}</>
      </MenuItem>
      <ul className='ml-6 flex w-full flex-col gap-1 lg:hidden'>
        {renderItems({ navTitle, menuItems })}
      </ul>
    </>
  );
};
