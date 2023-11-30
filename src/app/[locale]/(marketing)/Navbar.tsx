'use client';

import { Link, useTranslations } from 'next-intl';
import Image from 'next/image';
import { createElement, useEffect, useState } from 'react';
import { IconContext } from 'react-icons';
import { BiTimer } from 'react-icons/bi';
import { BsChatLeftText, BsChevronRight, BsRobot, BsTags } from 'react-icons/bs';
import { GoBrowser } from 'react-icons/go';
import {
  HiOutlineBars2, HiOutlineChevronDown, HiOutlineCog6Tooth, HiOutlineInboxArrowDown,
  HiOutlineLifebuoy, HiOutlinePower, HiOutlineUserCircle
} from 'react-icons/hi2';
import { RiCheckboxMultipleBlankFill, RiMailSendLine } from 'react-icons/ri';
import { TbChartGridDots } from 'react-icons/tb';

import chattingImage from '../../../../public/graphics/chatting.png';
import plansImage from '../../../../public/graphics/plans.png';
import logoImage from '../../../../public/logo.png';
import { MegaMenu, MenuItemData } from '../MegaMenu';

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
            <div className='w-6 bg-black rounded-full' />
          </div>
          <HiOutlineChevronDown
            strokeWidth={2.5}
            className={`h-3 w-3 transition-transform ${isMenuOpen ? 'rotate-180' : ''
              }`}
          />
        </button>
        <ul className='p-1 dropdown-content dropdown-bottom'>
          {profileMenuItems.map(({ label, icon }, key) => {
            const isLastItem = key === profileMenuItems.length - 1;
            return (
              <li
                key={label}
                className={`flex items-center gap-2 rounded ${isLastItem
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

export default function Navbar() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const t = useTranslations('navbar');
  const toggleIsNavOpen = () => setIsNavOpen((cur) => !cur);

  useEffect(() => {
    window?.addEventListener(
      'resize',
      () => window?.innerWidth >= 960 && setIsNavOpen(false)
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
        <div className='flex gap-x-2'>
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
        </div>
      </IconContext.Provider>
    );
  }

  return (
    <section
      id='navbar'
      className='relative items-center max-w-full mx-auto text-black bg-white border-2 rounded-none shadow-2xl navbar dark:bg-black space-around border-black/25 lg:flex'
    >
      <div className='navbar-start '>
        <h2 className='flex gap-2 ml-2 mr-4 text-lg font-medium cursor-pointer place-items-center'>
          <Image
            src={logoImage}
            alt='Logo'
            className='h-6 w-6 p-1  bg-[conic-gradient(at_left,_var(--tw-gradient-stops))] from-yellow-500 via-purple-500 to-blue-500 rounded-2xl shadow-2xl'
          />

        </h2>
      </div>
      <div className='navbar-center'>
        <NavList />
      </div>

      <div className='flex navbar-end'>
        <ProfileMenu />
        <Link href={{ pathname: '/dash/home' }} key='dash'>
          <button
            type='button'
            className='flex btn btn-outline place-items-center'
          >
            Dash
            <BsChevronRight />
          </button>
        </Link>
      </div>
      {/* <MobileNav open={isNavOpen} className='overflow-scroll'>
        <NavList />
      </MobileNav> */}
    </section>
  );
}
