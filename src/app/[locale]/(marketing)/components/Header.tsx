'use client'
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { Fragment, useState } from 'react';
import { useTimeout } from 'usehooks-ts';

import { Popover, Transition } from '@headlessui/react';

import { signoutSession, useAuthContext } from '../../(hooks)/AuthProvider';
import ekrataLogo from '../../../../../public/graphics/ekrataLogo.png';
import { Button } from './Button';
import { Container } from './Container';
import { LoginModal } from './LoginModal';
import { Logo } from './Logo';
import { NavLink } from './NavLink';
import { SignupModal } from './SignupModal';

export function Header() {
  const t = useTranslations('marketing')
  const [user] = useAuthContext()
  const [scrolling, setScrolling] = useState<boolean>()
  const [sessionUser, setSessionUser] = useAuthContext()

  window?.addEventListener('scroll', () => {
    setScrolling(true);
    useTimeout(() => setScrolling(false), 5000);
  });

  window?.addEventListener('onscrollend', () => {
    setScrolling(false)
  });

  function MobileNavLink({ href, children, hash }: {
    href: string,
    hash?: string,
    children: React.ReactNode
  }) {
    return (
      <Popover.Button as={Link} href={{ pathname: href, hash: hash ?? '' }} shallow className="block w-full p-2">
        {children}
      </Popover.Button>
    )
  }

  function MobileNavIcon({ open }: { open: boolean }) {
    return (
      <svg
        aria-hidden="true"
        className="h-3.5 w-3.5 overflow-visible stroke-slate-700"
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
      >
        <path
          d="M0 1H14M0 7H14M0 13H14"
          className={clsx(
            'origin-center transition',
            open && 'scale-90 opacity-0',
          )}
        />
        <path
          d="M2 2L12 12M12 2L2 12"
          className={clsx(
            'origin-center transition',
            !open && 'scale-90 opacity-0',
          )}
        />
      </svg>
    )
  }

  function MobileNavigation() {
    return (
      <Popover>
        <Popover.Button
          className="relative z-10 flex items-center justify-center w-8 h-8 ui-not-focus-visible:outline-none"
          aria-label="Toggle Navigation"
        >
          {({ open }) => <MobileNavIcon open={open} />}
        </Popover.Button>
        <Transition.Root>
          <Transition.Child
            as={Fragment}
            enter="duration-150 ease-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="duration-150 ease-in"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Popover.Overlay className="fixed inset-0 bg-slate-300/50" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="duration-150 ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="duration-100 ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Popover.Panel
              as="div"
              className="absolute inset-x-0 flex flex-col p-4 mt-4 text-lg tracking-tight origin-top bg-white shadow-xl top-full rounded-2xl text-slate-900 ring-1 ring-slate-900/5"
            >
              <MobileNavLink href={`#features`} >Features</MobileNavLink>
              {/* <MobileNavLink href="#testimonials">Testimonials</MobileNavLink> */}
              <MobileNavLink href={`#pricing`}>Pricing</MobileNavLink>
              <hr className="m-2 border-slate-300/40" />
              <MobileNavLink href=''>
                {user ? t('Sign out') : <LoginModal>{t('Sign in')}</LoginModal>}
              </MobileNavLink>
              <Button href={{ pathname: "/register" }} color="blue">
                <span>
                  {user ? t('Go to app') : t('Start free trial')}
                </span>
              </Button>
            </Popover.Panel>
          </Transition.Child>
        </Transition.Root>
      </Popover >
    )
  }
  return (
    <header className={`fixed z-50 w-full py-2  ${scrolling ? 'bg-white/100 shadow-md animate-fade  ' : 'bg-white/0 border-0 shadow-none'} backdrop-blur-xl`}>
      <Container>
        <nav className="relative flex justify-between animate-fade-down">
          <div className="flex items-center md:gap-x-12">
            <Link href="#" aria-label="Home" >
              <Image src={ekrataLogo} className="w-auto rounded-md shadow-2xl saturate-200 ring-2 ring-blue-400 mask mask-squircle" width={20} height={20} alt={''}></Image>
            </Link>
            <div className="hidden md:flex md:gap-x-6">
              <NavLink hash='features' href=''>Features</NavLink>
              {/* <NavLink href="#testimonials">Testimonials</NavLink> */}
              <NavLink hash='pricing' href='' >Pricing</NavLink>
            </div>
          </div>
          <div className="flex items-center gap-x-5 md:gap-x-8">
            <div className="hidden md:block" onClick={() => {
              user && signoutSession()
            }}>
              <NavLink href="" >
                {user ? <div onClick={() => setSessionUser(null)}>{t('Sign out')}</div> : <LoginModal>{<span className='animate-fade-down'>{t('Sign in')}</span>}</LoginModal>}
              </NavLink>
            </div>
            <Link href={{ pathname: user ? '/dash/conversations' : '' }}>
              <Button color="blue" className='bg-gradient-to-tr from-violet-500 to-orange-300 hover:animate-pulse'>
                <span>
                  {user ? t('Go to app') : <SignupModal>{t('Start free trial')}</SignupModal>}
                </span>
              </Button>
            </Link>
            <div className="-mr-1 md:hidden">
              <MobileNavigation />
            </div>
          </div>
        </nav>
      </Container>
    </header>
  )
}
