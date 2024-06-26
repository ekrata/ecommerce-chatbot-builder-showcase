'use-client';

import { PropsWithChildren } from "react";


import { Link } from 'next-intl';
import { useState, FC } from 'react';
import { HiOutlineChevronDown, HiOutlineRocketLaunch } from 'react-icons/hi2';

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
    <Typography
      variant='h4'
      className='mb-1 text-primary border-grey-400 border-b-2'
    >
      {navTitle}
    </Typography>
    {Object.entries(menuItems).map(([, items]) => (
      <>
        <Typography variant='h5' className='mb-1'>
          {menuItems.title}
        </Typography>

        {items.map(({ title, description, route, icon }) => (
          <Link href={{ pathname: route }} key={title}>
            <MenuItem className=''>
              <Typography variant='h6' className='mb-1'>
                {title}
              </Typography>
              <Typography variant='small' color='gray' className='font-normal'>
                {description}
              </Typography>
            </MenuItem>
          </Link>
        ))}
      </>
    ))}
  </>
);

export const MegaMenu: FC<
  Props & { navIcon: JSX.Element; dropdownImg: JSX.Element }
> = ({ navTitle, navIcon, menuItems, dropdownImg }) => {
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
              className='hidden items-center gap-2 text-blue-gray-900 lg:flex lg:rounded-full'
            >
              <>{navIcon}</>
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
          className='hidden w-[36rem] grid-cols-7 gap-3 overflow-visible lg:grid animate-in fade-in zoom-in"'
        >
          <Card
            color='blue'
            shadow={false}
            variant='gradient'
            className='col-span-3 grid h-full w-full place-items-center rounded-md'
          >
            <>{dropdownImg}</>
            <HiOutlineRocketLaunch strokeWidth={1} className='h-28 w-28' />
          </Card>
          <ul className='col-span-4 flex w-full flex-col gap-1'>
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
