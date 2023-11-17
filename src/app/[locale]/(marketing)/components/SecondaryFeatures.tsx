'use client'

import clsx from 'clsx';
import Image, { ImageProps } from 'next/image';
import { useId } from 'react';
import { BiHelpCircle } from 'react-icons/bi';
import { BsChatLeft, BsRobot } from 'react-icons/bs';

import { Tab } from '@headlessui/react';

import { Container } from '../components/Container';
import screenshotContacts from '../images/screenshots/contacts.png';
import screenshotInventory from '../images/screenshots/inventory.png';
import screenshotProfitLoss from '../images/screenshots/profit-loss.png';

interface Feature {
  name: React.ReactNode
  summary: string
  description: string
  image: ImageProps['src']
  icon: React.ComponentType
}

const features: Array<Feature> = [
  {
    name: 'Live chat',
    summary: "Capture Attention, Drive Conversions, and Build Loyalty with Live Chat",
    description:
      `With live chat, you can gain valuable insights into your visitors' behavior, tracking their browsing activity in real time. This real-time visibility empowers you to understand their interests, preferences, and potential pain points. 
      
      Live chat is not just about answering questions; it's about creating a connection, building relationships, and turning visitors into loyal customers. By engaging in real-time conversations, you can address their needs, provide personalized solutions, and ultimately, drive conversions`,
    image: screenshotProfitLoss,
    icon: function ReportingIcon() {
      let id = useId()
      return (
        <BsChatLeft className="text-xl text-white place-items-center" />
      )
    },
  },
  {
    name: 'Chatbot',
    summary:
      'Automate Customer Support, Enhance Efficiency, and Boost Conversions with Our AI-Powered Chatbot',
    description:
      "Our AI-powered chatbot seamlessly integrates into your website, providing real-time support, answering questions, resolving issues, and guiding customers through the purchasing process. This automated assistance not only enhances customer satisfaction but also reduces cart abandonment, leading to increased sales and revenue.",
    image: screenshotInventory,
    icon: function InventoryIcon() {
      return (
        <BsRobot className="text-xl text-white place-items-center" />
      )
    },
  },
  {
    name: 'Help Center & Knowledge Base',
    summary:
      "Empower Customers with Self-Service and Unleash Your Team's Potential with Our Comprehensive Help Center",
    description:
      "In today's digital world, customers expect immediate and convenient access to information. Our robust help center empowers you to provide up-to-date information to users, answering frequently asked questions (FAQs) and addressing common concerns. This self-service approach not only enhances customer satisfaction but also frees up your valuable customer service team to focus on maximizing customer satisfaction.",
    image: screenshotContacts,
    icon: function ContactsIcon() {
      return (
        <BiHelpCircle className="text-xl text-white place-items-center" />
      )
    },
  },
]

function Feature({
  feature,
  isActive,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & {
  feature: Feature
  isActive: boolean
}) {
  return (
    <div
      className={clsx(className, !isActive && 'opacity-75 hover:opacity-100')}
      {...props}
    >
      <div
        className={clsx(
          'w-9 rounded-lg',
          isActive ? 'bg-[conic-gradient(at_left,_var(--tw-gradient-stops))] from-rose-500 to-indigo-700' : 'bg-[conic-gradient(at_left,_var(--tw-gradient-stops))] from-rose-500/10 to-indigo-700/10',
        )}
      >
        <svg aria-hidden="true" className="p-2 h-9 w-9" fill="none">
          <feature.icon />
        </svg>
      </div>
      <h3
        className={clsx(
          'mt-6 text-sm font-medium',
          isActive ? 'bg-[conic-gradient(at_left,_var(--tw-gradient-stops))] from-rose-500 to-indigo-700 bg-clip-text text-transparent' : 'text-slate-600',
        )}
      >
        {feature.name}
      </h3>
      <p className="mt-2 text-xl font-display text-slate-900">
        {feature.summary}
      </p>
      <p className="mt-4 text-sm text-slate-600">{feature.description}</p>
    </div>
  )
}

function FeaturesMobile() {
  return (
    <div className="flex flex-col px-4 mt-20 -mx-4 overflow-hidden gap-y-10 sm:-mx-6 sm:px-6 lg:hidden">
      {features.map((feature) => (
        <div key={feature.summary}>
          <Feature feature={feature} className="max-w-2xl mx-auto" isActive />
          <div className="relative pb-10 mt-10">
            <div className="absolute bottom-0 -inset-x-4 top-8 bg-slate-200 sm:-inset-x-6" />
            <div className="relative mx-auto w-[52.75rem] overflow-hidden rounded-xl bg-white shadow-lg shadow-slate-900/5 ring-1 ring-slate-500/10">
              <Image
                className="w-full"
                src={feature.image}
                alt=""
                sizes="52.75rem"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function FeaturesDesktop() {
  return (
    <Tab.Group as="div" className="hidden lg:mt-20 lg:block">
      {({ selectedIndex }) => (
        <>
          <Tab.List className="grid grid-cols-3 gap-x-8">
            {features.map((feature, featureIndex) => (
              <Feature
                key={feature.summary}
                feature={{
                  ...feature,
                  name: (
                    <Tab className="ui-not-focus-visible:outline-none">
                      <span className="absolute inset-0" />
                      {feature.name}
                    </Tab>
                  ),
                }}
                isActive={featureIndex === selectedIndex}
                className="relative"
              />
            ))}
          </Tab.List>
          <Tab.Panels className="relative py-16 mt-20 overflow-hidden rounded-4xl bg-slate-200 px-14 xl:px-16">
            <div className="flex -mx-5">
              {features.map((feature, featureIndex) => (
                <Tab.Panel
                  static
                  key={feature.summary}
                  className={clsx(
                    'px-5 transition duration-500 ease-in-out ui-not-focus-visible:outline-none',
                    featureIndex !== selectedIndex && 'opacity-60',
                  )}
                  style={{ transform: `translateX(-${selectedIndex * 100}%)` }}
                  aria-hidden={featureIndex !== selectedIndex}
                >
                  <div className="w-[52.75rem] overflow-hidden rounded-xl bg-white shadow-lg shadow-slate-900/5 ring-1 ring-slate-500/10">
                    <Image
                      className="w-full"
                      src={feature.image}
                      alt=""
                      sizes="52.75rem"
                    />
                  </div>
                </Tab.Panel>
              ))}
            </div>
            <div className="absolute inset-0 pointer-events-none rounded-4xl ring-1 ring-inset ring-slate-900/10" />
          </Tab.Panels>
        </>
      )}
    </Tab.Group>
  )
}

export function SecondaryFeatures() {
  return (
    <section
      id="secondary-features"
      aria-label="Features for simplifying everyday business tasks"
      className="pt-20 pb-14 sm:pb-20 sm:pt-32 lg:pb-32"
    >
      <Container>
        <div className="max-w-2xl mx-auto md:text-center">
          <h2 className="text-3xl tracking-tight font-display text-slate-900 sm:text-4xl">
            Elevate your customer service with eChat by Ekrata™️ - the AI-driven solution.
          </h2>
          <p className="mt-4 text-lg tracking-tight text-slate-700">
            eChat's AI-powered customer service solutions seamlessly blend human expertise with AI intelligence to provide an unparalleled customer experience.
          </p>
        </div>
        <FeaturesMobile />
        <FeaturesDesktop />
      </Container>
    </section>
  )
}
