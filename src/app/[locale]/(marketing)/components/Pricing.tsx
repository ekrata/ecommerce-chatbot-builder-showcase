'use client'
import cn from 'classnames';
import clsx from 'clsx';
import { useTranslations } from 'next-intl';
import { ReactElement, useMemo, useState } from 'react';
import { AiOutlineNodeIndex } from 'react-icons/ai';
import { BiSolidHelpCircle } from 'react-icons/bi';
import { BsGlobe, BsInfinity, BsPerson, BsPersonLinesFill, BsRobot } from 'react-icons/bs';
import { FaMailBulk, FaShopify } from 'react-icons/fa';
import { FaFacebookMessenger, FaInstagram, FaPeopleGroup, FaWhatsapp } from 'react-icons/fa6';
import { FiMinus, FiPlus } from 'react-icons/fi';
import { MdAutoGraph, MdOutlineDraw } from 'react-icons/md';

import { RadioGroup } from '@headlessui/react';

import { useAuthContext } from '../../(hooks)/AuthProvider';
import monthlyPaymentLinks from '../../../../../data/stripe/local-monthly-paymentLinks.json';
import yearlyPaymentLinks from '../../../../../data/stripe/local-yearly-paymentLinks.json';
import { TriggerAmount, triggerAmount } from '../../../../../types/stripe';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { SignupModal } from './SignupModal';

function SwirlyDoodle(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 281 40"
      preserveAspectRatio="none"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M240.172 22.994c-8.007 1.246-15.477 2.23-31.26 4.114-18.506 2.21-26.323 2.977-34.487 3.386-2.971.149-3.727.324-6.566 1.523-15.124 6.388-43.775 9.404-69.425 7.31-26.207-2.14-50.986-7.103-78-15.624C10.912 20.7.988 16.143.734 14.657c-.066-.381.043-.344 1.324.456 10.423 6.506 49.649 16.322 77.8 19.468 23.708 2.65 38.249 2.95 55.821 1.156 9.407-.962 24.451-3.773 25.101-4.692.074-.104.053-.155-.058-.135-1.062.195-13.863-.271-18.848-.687-16.681-1.389-28.722-4.345-38.142-9.364-15.294-8.15-7.298-19.232 14.802-20.514 16.095-.934 32.793 1.517 47.423 6.96 13.524 5.033 17.942 12.326 11.463 18.922l-.859.874.697-.006c2.681-.026 15.304-1.302 29.208-2.953 25.845-3.07 35.659-4.519 54.027-7.978 9.863-1.858 11.021-2.048 13.055-2.145a61.901 61.901 0 0 0 4.506-.417c1.891-.259 2.151-.267 1.543-.047-.402.145-2.33.913-4.285 1.707-4.635 1.882-5.202 2.07-8.736 2.903-3.414.805-19.773 3.797-26.404 4.829Zm40.321-9.93c.1-.066.231-.085.29-.041.059.043-.024.096-.183.119-.177.024-.219-.007-.107-.079ZM172.299 26.22c9.364-6.058 5.161-12.039-12.304-17.51-11.656-3.653-23.145-5.47-35.243-5.576-22.552-.198-33.577 7.462-21.321 14.814 12.012 7.205 32.994 10.557 61.531 9.831 4.563-.116 5.372-.288 7.337-1.559Z"
      />
    </svg>
  )
}

function CheckIcon({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg
      aria-hidden="true"
      className={clsx(
        'h-6 w-6 flex-none fill-current stroke-current',
        className,
      )}
      {...props}
    >
      <path
        d="M9.307 12.248a.75.75 0 1 0-1.114 1.004l1.114-1.004ZM11 15.25l-.557.502a.75.75 0 0 0 1.15-.043L11 15.25Zm4.844-5.041a.75.75 0 0 0-1.188-.918l1.188.918Zm-7.651 3.043 2.25 2.5 1.114-1.004-2.25-2.5-1.114 1.004Zm3.4 2.457 4.25-5.5-1.187-.918-4.25 5.5 1.188.918Z"
        strokeWidth={0}
      />
      <circle
        cx={12}
        cy={12}
        r={8.25}
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Plan({
  name,
  price,
  description,
  href,
  features,
  featured = false,
}: {
  name: string
  price: string
  description: string
  href: string
  features: Array<ReactElement>
  featured?: boolean
}) {
  const t = useTranslations('marketing')
  const [sessionUser] = useAuthContext()
  const priceElement = useMemo(() => (

    <p className="flex flex-row order-first text-5xl font-light tracking-tight text-white gap-x-2 place-items-center font-display animate-fade-left ">
      {price} <span className='flex flex-col text-xs leading-tight gap-y-0'>
        <span>USD</span>
        <span>/month</span>
      </span>
    </p>
  ), [price])
  return (
    <section
      className={clsx(
        'flex flex-col rounded-3xl px-6 sm:px-8 animate-fade-down',
        featured ? 'order-first bg-gradient-to-tr from-violet-500 to-orange-300 py-8 lg:order-none' : 'lg:py-8',
      )}
    >
      <h3 className="mt-5 text-lg text-white font-display">{name}</h3>
      <p
        className={clsx(
          'mt-2 text-base',
          featured ? 'text-white' : 'text-slate-400',
        )}
      >
        {description}
      </p>

      <div className='flex flex-row justify-between'>
        {priceElement}
      </div>
      <ul
        role="list"
        className={clsx(
          'order-last mt-10 flex flex-col gap-y-3 text-sm',
          featured ? 'text-white' : 'text-slate-200',
        )}
      >
        {features.map((feature) => (
          <li key={feature} className="flex">
            {/* <CheckIcon className={featured ? 'text-white' : 'text-slate-400'} /> */}
            <span className="ml-4">{feature}</span>
          </li>
        ))}
      </ul>
      {!sessionUser ? (
        <SignupModal>
          <Button
            // href={{ pathname: href }}
            variant={featured ? 'solid' : 'outline'}
            color="white"
            className="w-full mt-8"
            aria-label={`Get started with the ${name} plan for ${price}`}
          >
            {t('Start free trial')}
          </Button>
        </SignupModal>
      ) : <Button
        href={{ pathname: href }}
        variant={featured ? 'solid' : 'outline'}
        color="white"
        className="mt-8"
        aria-label={`Get started with the ${name} plan for ${price}`}
      >
        {t('Start free trial')}
      </Button>}
    </section>
  )
}

const frequencies = [
  { value: 'monthly', label: 'Monthly', priceSuffix: '/month' },
  { value: 'annually', label: 'Annually', priceSuffix: '/year' },
]


export function Pricing() {
  const triggerCounts = triggerAmount
  const t = useTranslations('marketing')
  const [frequency, setFrequency] = useState(frequencies[0])
  const [seats, setSeats] = useState(1)
  const [triggerIndex, setTriggerIndex] = useState(0)

  const getPrices = () => {
    if (frequency.value === 'monthly') {
      const plusLink = monthlyPaymentLinks.plusLinks.flat().find((link) => parseInt(link.metadata.seatCount, 10) === seats && parseInt(link.metadata.triggerCount, 10) === triggerAmount[triggerIndex]);
      const starterLink = (monthlyPaymentLinks.starterLinks.flat().find((link) => parseInt(link.metadata.seatCount, 10) === seats && parseInt(link.metadata.triggerCount, 10) === triggerAmount[triggerIndex]))
      const plusPrice = (plusLink?.items.reduce((prev, next) => prev + next.unit_amount, 0) ?? 0) / 100
      const starterPrice = (starterLink?.items.reduce((prev, next) => prev + next.unit_amount, 0) ?? 0) / 100
      return { plusLink, starterLink, starterPrice, plusPrice }
    }
    if (frequency.value === 'annually') {
      const plusLink = yearlyPaymentLinks.plusLinks.flat().find((link) => parseInt(link.metadata.seatCount, 10) === seats && parseInt(link.metadata.triggerCount, 10) === triggerAmount[triggerIndex]);
      const starterLink = (yearlyPaymentLinks.starterLinks.flat().find((link) => parseInt(link.metadata.seatCount, 10) === seats && parseInt(link.metadata.triggerCount, 10) === triggerAmount[triggerIndex]))
      const starterPrice = ((starterLink?.items.reduce((prev, next) => prev + next.unit_amount, 0) ?? 0) / 12) / 100
      const plusPrice = ((plusLink?.items.reduce((prev, next) => prev + next.unit_amount, 0) ?? 0) / 12) / 100
      return { plusLink, starterLink, starterPrice, plusPrice }
    }
    return { plusLink: {}, starterLink: {}, starterPrice: 0, plusPrice: 0 }
  }
  const { starterLink, plusLink, starterPrice, plusPrice } = getPrices()
  return (
    <section
      id="pricing"
      aria-label="Pricing"
      className="py-20 bg-slate-900 sm:py-32"
    >
      <Container>
        <div className="md:text-center">
          <h2 className="text-3xl tracking-tight text-white font-display sm:text-4xl">
            <span className="relative whitespace-nowrap">
              {/* <SwirlyDoodle className="absolute left-0 top-1/2 h-[1em] w-full fill-violet-700" /> */}
              <span className="relative">Simple pricing,</span>
            </span>{' '}
            for everyone.
          </h2>
          {/* <p className="mt-4 text-lg text-slate-400">
            It doesn’t matter what size your business is, our software won’t
            work well for you.
          </p> */}
          <div className="flex justify-center mt-8">
            <RadioGroup
              value={frequency}
              onChange={setFrequency}
              className="grid grid-cols-2 p-1 text-xs font-semibold leading-5 text-center text-white rounded-full gap-x-1 bg-white/5"
            >
              <RadioGroup.Label className="sr-only">Payment frequency</RadioGroup.Label>
              {frequencies.map((option) => (
                <RadioGroup.Option
                  key={option.value}
                  value={option}
                  className={({ checked }) =>
                    cn(checked ? 'bg-gradient-to-tr from-violet-500 to-orange-300 animate-rotate-x' : '', 'cursor-pointer rounded-full px-2.5 py-1')
                  }
                >
                  <span>{option.label}{option.value === 'annually' && <span className='ml-4 text-xs border-0 badge info bg-[conic-gradient(at_left,_var(--tw-gradient-stops))] from-rose-500 to-indigo-700'>{t('Save 20%')}</span>}</span>
                </RadioGroup.Option>
              ))}
            </RadioGroup>
          </div>
          <div className='flex flex-col justify-center mt-10 md:flex-row gap-x-4 gap-y-2'>
            <h2 className="inline-flex justify-between p-2 px-4 text-sm tracking-tight text-white rounded-md shadow-2xl bg-gradient-to-tr from-violet-500/25 to-orange-300/75 md:text-base place-items-center gap-x-2 font-display sm:text-xl ">
              <div className='flex flex-row place-items-center gap-x-2'>
                <BsPerson></BsPerson>Seats
              </div>
              <div className='justify-end'>
                <button className='mx-4 rounded-md btn btn-xs hover:animate-pulse' disabled={seats === 1} onClick={() => setSeats(seats - 1)}><FiMinus /></button>
                {seats}
                <button className='mx-4 rounded-md btn btn-xs hover:animate-pulse' disabled={seats === 5} onClick={() => setSeats(seats + 1)}><FiPlus /></button>
              </div>
            </h2>
            <div>

            </div>
            <h2 className="inline-flex justify-between p-2 px-4 text-sm tracking-tight text-white rounded-md shadow-2xl bg-gradient-to-tr from-violet-500/75 to-orange-300/25 place-items-center gap-x-2 md:text-base font-display ">
              <div className='flex flex-row place-items-center gap-x-2'>
                <BsRobot></BsRobot>Triggers
              </div>

              <div className='justify-end'>

                <button className='mx-4 rounded-md btn btn-xs hover:animate-pulse' disabled={triggerIndex === 0} onClick={() => setTriggerIndex(triggerIndex - 1)}><FiMinus /></button>
                {triggerAmount[triggerIndex]}
                <button className='mx-4 rounded-md btn btn-xs hover:animate-pulse' disabled={triggerIndex === triggerCounts.length - 1} onClick={() => setTriggerIndex(triggerIndex + 1)}><FiPlus /></button>
              </div>
            </h2>
            <div>

            </div>
          </div>
        </div >
        <div className="grid max-w-2xl grid-cols-1 mt-10 -mx-4 gap-y-10 sm:mx-auto lg:-mx-8 lg:max-w-none lg:grid-cols-2 xl:mx-0 xl:gap-x-8">
          <Plan
            name="Starter"
            price={`$ ${starterPrice.toString()}`}
            description={t("Increase website engagement and boost customer satisfaction with website live chat, chatbot, and custom bot creation")}
            href={starterLink?.url ?? ''}
            features={[
              <span className='inline-flex place-items-center gap-x-2'><BsInfinity className='text-xl' />{t('Unlimited live chats')}</span>,
              <span className='inline-flex place-items-center gap-x-2'><BsRobot className='text-xl' />{t("Multiply your team's productivity with our advanced AI Chatbot")}</span>,
              <span className='inline-flex place-items-center gap-x-2'><AiOutlineNodeIndex className='text-xl' />{t("Automate immediately with our chatbot templates")}</span>,
              <span className='inline-flex place-items-center gap-x-2'><MdOutlineDraw className='text-xl' />{t("Build your own custom chatbots with our easy to use visual bot builder")}</span>,
              <span className=' gap-x-2'>
                <span className='inline-flex place-items-center gap-x-2'>
                  <MdAutoGraph className='text-xl' />{t('Track growth and customer success metrics with our analytics')}
                </span>
                <span className=" badge bg-gradient-to-br from-violet-500/50 to-orange-300/50">{t('Coming soon')}</span>
              </span>,
              <span className='inline-flex place-items-center gap-x-2'><FaPeopleGroup className='text-xl' />{t("Live visitor list")}</span>,
              <span className='inline-flex place-items-center gap-x-2'><BsPersonLinesFill className='text-xl' />{t("Live visitor info")}</span>,
              <span className=' gap-x-2'>
                <span className='inline-flex place-items-center gap-x-2'>
                  <BsGlobe className='text-xl' />{t("Internationalization")}
                </span>
                <br />
                <span className=" badge bg-gradient-to-br from-violet-500/50 to-orange-300/50">{t('Coming soon')}</span>
              </span>,
            ]}
          />
          <Plan
            featured
            name="Plus"
            price={`$ ${plusPrice.toString()}`}
            description={t("All you need to scale and take your customer service to the next level")}
            href={plusLink?.url ?? ''}
            features={[
              <span className='inline-flex place-items-center gap-x-2'><BiSolidHelpCircle className="text-4xl" />{t('Help Center and Articles integrated into chat widget')}</span>,
              <span className='inline-flex place-items-center gap-x-2'><FaMailBulk className='text-xl' />{t('Handle tickets with email')}</span>,
              <span>
                <span className='inline-flex place-items-center gap-x-2'><FaFacebookMessenger className='text-xl' /><FaInstagram className='text-xl' /><FaWhatsapp className='text-xl' />{t('Facebook, Instagram and Whatsapp Omnichannel Integration')}
                </span>
                <span className="border-0 shadow-2xl badge bg-gradient-to-br from-violet-500/100 to-orange-300/100">{t('Coming soon')}</span>
              </span>,
              <span>
                <span className='inline-flex place-items-center gap-x-2'><FaShopify className='text-xl' />{t('Drive growth with our native shopify actions')}
                </span>
                <br />
                <span className="border-0 shadow-2xl badge bg-gradient-to-br from-violet-500/100 to-orange-300/100">{t('Coming soon')}</span>
              </span>,
              <span className='inline-flex place-items-center gap-x-2'><FaMailBulk className='text-xl' />{t("Everything in starter")}</span>,
            ]}
          />
          {/* <Plan
            name="Enterprise"
            price="$39"
            description="For even the biggest enterprise companies."
            href="/register"
            features={[
              'Send unlimited quotes and invoices',
              'Connect up to 15 bank accounts',
              'Track up to 200 expenses per month',
              'Automated payroll support',
              'Export up to 25 reports, including TPS',
            ]}
          /> */}
        </div>

      </Container>
    </section >
  )
}


