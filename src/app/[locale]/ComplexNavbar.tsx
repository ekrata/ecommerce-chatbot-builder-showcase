'use client';

import { createElement, useEffect, useState } from 'react';
import {
  HiOutlineBars2,
  HiOutlineChevronDown,
  HiOutlineCog6Tooth,
  HiOutlineInboxArrowDown,
  HiOutlineLifebuoy,
  HiOutlinePower,
  HiOutlineUserCircle,
} from 'react-icons/hi2';
import { GoBrowser } from 'react-icons/go';
import { BiTimer } from 'react-icons/bi';
import Image from 'next/image';
import { Link, useTranslations } from 'next-intl';
import {
  BsChatLeftText,
  BsChevronRight,
  BsRobot,
  BsTags,
} from 'react-icons/bs';
import { IconContext } from 'react-icons';
import { TbChartGridDots } from 'react-icons/tb';
import { RiCheckboxMultipleBlankFill, RiMailSendLine } from 'react-icons/ri';
import {
  Avatar,
  Button,
  Menu,
  MenuHandler,
  MenuItem,
  MenuList,
  MobileNav,
  Navbar,
  Typography,
} from '../mt-components';
import { MegaMenu, MenuItemData } from './MegaMenu';
import chattingImage from '../../../public/graphics/chatting.png';
import plansImage from '../../../public/graphics/plans.png';
import logoImage from '../../../public/logo.png';

// profile menu component
const profileMenuItems = [
  {
    label: 'My Profile',
    icon: HiOutlineUserCircle,
  },
  {
    label: 'Edit Profile',
    icon: HiOutlineCog6Tooth,
  },
  {
    label: 'Inbox',
    icon: HiOutlineInboxArrowDown,
  },
  {
    label: 'Help',
    icon: HiOutlineLifebuoy,
  },
  {
    label: 'Sign Out',
    icon: HiOutlinePower,
  },
];

function ProfileMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <Menu open={isMenuOpen} handler={setIsMenuOpen} placement='bottom-end'>
      <MenuHandler>
        <Button
          variant='text'
          color='blue-gray'
          className='flex items-center gap-1 rounded-full py-0.5 pr-2 pl-0.5 lg:ml-auto'
        >
          <Avatar
            variant='circular'
            size='sm'
            alt='candice wu'
            className='border border-purple-500 p-0.5'
            src='https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80'
          />
          <HiOutlineChevronDown
            strokeWidth={2.5}
            className={`h-3 w-3 transition-transform ${
              isMenuOpen ? 'rotate-180' : ''
            }`}
          />
        </Button>
      </MenuHandler>
      <MenuList className='p-1'>
        {profileMenuItems.map(({ label, icon }, key) => {
          const isLastItem = key === profileMenuItems.length - 1;
          return (
            <MenuItem
              key={label}
              onClick={closeMenu}
              className={`flex items-center gap-2 rounded ${
                isLastItem
                  ? 'hover:bg-red-500/10 focus:bg-red-500/10 active:bg-red-500/10'
                  : ''
              }`}
            >
              {createElement(icon, {
                className: `h-4 w-4 ${isLastItem ? 'text-red-500' : ''}`,
                strokeWidth: 2,
              })}
              <Typography
                as='span'
                variant='small'
                className='font-normal'
                color={isLastItem ? 'red' : 'inherit'}
              >
                {label}
              </Typography>
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
}

// nav list component

export default function ComplexNavbar() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const t = useTranslations('navbar');
  const toggleIsNavOpen = () => setIsNavOpen((cur) => !cur);

  useEffect(() => {
    window.addEventListener(
      'resize',
      () => window.innerWidth >= 960 && setIsNavOpen(false)
    );
  }, []);

  const productsMenu: { [key: string]: MenuItemData[] } = {};
  productsMenu[`${t('products.customer-service.title')}`] = [
    {
      title: t('products.customer-service.live-chat.title'),
      description: t('products.customer-service.live-chat.description'),
      route: '/customer-service/live-chat',
      icon: <BsChatLeftText />,
    },
    {
      title: t('products.customer-service.chat-bot.title'),
      description: t('products.customer-service.chat-bot.description'),
      route: '/customer-service/chat-bot',
      icon: <BsRobot />,
    },
    {
      title: t('products.customer-service.multichannel.title'),
      description: t('products.customer-service.multichannel.description'),
      route: '/customer-service/multichannel',
      icon: <BsRobot />,
    },
  ];
  productsMenu[`${t('products.sales-analytics.title')}`] = [
    {
      title: t('products.sales-analytics.live-analytics.title'),
      description: t('products.sales-analytics.live-analytics.description'),
      route: '/sales-analytics/live-analytics',
      icon: <BiTimer />,
    },
    {
      title: t('products.sales-analytics.intelligent-analytics.title'),
      description: t(
        'products.sales-analytics.intelligent-analytics.description'
      ),
      route: 'sales-analytics/intelligent-analytics',
      icon: <TbChartGridDots />,
    },
  ];

  productsMenu[`${t('products.marketing-advertising.title')}`] = [
    {
      title: t('products.marketing-advertising.email-marketing.title'),
      description: t(
        'products.marketing-advertising.email-marketing.description'
      ),
      route: '/marketing-advertising/email-marketing',
      icon: <RiMailSendLine />,
    },
    {
      title: t('products.marketing-advertising.multichannel-marketing.title'),
      description: t(
        'products.marketing-advertising.multichannel-marketing.description'
      ),
      route: '/marketing-advertising/multichannel-marketing',
      icon: <RiCheckboxMultipleBlankFill />,
    },
  ];
  function NavList() {
    return (
      <IconContext.Provider value={{ color: 'blue', className: 'h-5 w-5' }}>
        <ul className='mb-4 mt-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center'>
          <MegaMenu
            navTitle={t('products.title')}
            menuItems={productsMenu}
            navIcon={<GoBrowser />}
            dropdownImage={chattingImage}
          />
          <MegaMenu
            navTitle={t('pricing.title')}
            menuItems={productsMenu}
            navIcon={<BsTags />}
            dropdownImage={plansImage}
          />
        </ul>
      </IconContext.Provider>
    );
  }

  return (
    <Navbar className='mx-auto max-w-full rounded-none p-1 lg:pl-6 border-0'>
      <div className='relative mx-auto flex items-center text-black'>
        <Typography
          as='h2'
          href='#'
          className='flex place-items-center gap-2 mr-4 ml-2 cursor-pointer text-lg font-medium'
        >
          <Image
            src={logoImage}
            alt='Logo'
            className='h-12 w-12 p-1  bg-[conic-gradient(at_left,_var(--tw-gradient-stops))] from-yellow-500 via-purple-500 to-blue-500 rounded-2xl shadow-2xl'
          />
          Crow Commerce
        </Typography>
        <div className='absolute top-2/4 left-2/4 hidden -translate-x-2/4 -translate-y-2/4 lg:block'>
          <NavList />
        </div>
        <Button
          size='sm'
          color='blue-gray'
          variant='text'
          onClick={toggleIsNavOpen}
          className='ml-auto mr-2 lg:hidden'
        >
          <HiOutlineBars2 className='h-6 w-6' />
        </Button>

        <ProfileMenu />
        <Link href={{ pathname: '/dash' }} key='dash'>
          <Button size='sm' className='flex place-items-center'>
            Dash
            <BsChevronRight />
          </Button>
        </Link>
      </div>
      <MobileNav open={isNavOpen} className='overflow-scroll'>
        <NavList />
      </MobileNav>
    </Navbar>
  );
}
