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

import { MegaMenu, MenuItemData } from '../MegaMenu';
import chattingImage from '../../../../public/graphics/chatting.png';
import plansImage from '../../../../public/graphics/plans.png';
import logoImage from '../../../../public/logo.png';

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
    <>
      <div className='dropdown'>
        <button
          type='button'
          color='blue-gray'
          className='btn btn-hidden flex items-center gap-1 rounded-full py-0.5 pr-2 pl-0.5 lg:ml-auto'
        >
          <div className='avatar border border-purple-500 p-0.5'>
            <div className='w-6 rounded-full bg-black' />
          </div>
          <HiOutlineChevronDown
            strokeWidth={2.5}
            className={`h-3 w-3 transition-transform ${
              isMenuOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        <ul className='p-1 dropdown-content dropdown-bottom'>
          {profileMenuItems.map(({ label, icon }, key) => {
            const isLastItem = key === profileMenuItems.length - 1;
            return (
              <li
                key={label}
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
                <p
                  className='font-normal'
                  color={isLastItem ? 'red' : 'inherit'}
                >
                  {label}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </>
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
        <ul className='flex gap-x-2'>
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
    <section
      id='navbar'
      className='navbar mx-auto bg-default space-around max-w-full rounded-none  border-2 border-black/25 shadow-2xl relative lg:flex items-center text-black'
    >
      <div className='navbar-start '>
        <h2 className='flex place-items-center gap-2 mr-4 ml-2 cursor-pointer text-lg font-medium'>
          <Image
            src={logoImage}
            alt='Logo'
            className='h-12 w-12 p-1  bg-[conic-gradient(at_left,_var(--tw-gradient-stops))] from-yellow-500 via-purple-500 to-blue-500 rounded-2xl shadow-2xl'
          />
          Crow Commerce
        </h2>
      </div>
      <div className='navbar-center'>
        <NavList />
      </div>

      <ProfileMenu />
      <Link href={{ pathname: '/dash' }} key='dash'>
        <button
          type='button'
          className='btn btn-outline flex place-items-center'
        >
          Dash
          <BsChevronRight />
        </button>
      </Link>

      <div className='navbar-end flex' />
      {/* <MobileNav open={isNavOpen} className='overflow-scroll'>
        <NavList />
      </MobileNav> */}
    </section>
  );
}
