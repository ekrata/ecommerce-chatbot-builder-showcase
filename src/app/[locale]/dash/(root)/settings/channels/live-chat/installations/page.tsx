'use client'

import { useTranslations } from 'next-intl';
import { FC, ReactNode, useState } from 'react';
import { Controller, Resolver, useForm } from 'react-hook-form';
import { BiLogoJavascript, BiLogoWordpress } from 'react-icons/bi';
import {
    BsChevronDown, BsChevronUp, BsClipboard, BsEye, BsPaintBucket, BsPhone
} from 'react-icons/bs';
import { FaDesktop, FaPaintBrush, FaShopify } from 'react-icons/fa';
import { FcCancel, FcCheckmark } from 'react-icons/fc';
import { SiWoocommerce } from 'react-icons/si';
import { useCopyToClipboard } from 'usehooks-ts';

import { useAuthContext } from '@/app/[locale]/(hooks)/AuthProvider';
import {
    useUpdateConfigurationMut
} from '@/app/[locale]/(hooks)/mutations/useUpdateConfigurationMut';
import { useConfigurationQuery } from '@/app/[locale]/(hooks)/queries/useConfigurationQuery';
import { useOrgQuery } from '@/app/[locale]/(hooks)/queries/useOrgQuery';
import { ConfigLiveChatAppearance } from '@/entities/configuration';
import { UpdateConfiguration } from '@/entities/entities';

const resolver: Resolver<ConfigLiveChatAppearance> = async (values) => {
  return {
    values,
    errors: {}
  };
};

interface Props {
  title: ReactNode,
  content: ReactNode
}

const Collapse: FC<Props> = ({ title, content }) => {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div className="bg-white collapse border-b-[1px] " onClick={() => setOpen(!open)}>
      <input type="checkbox" />
      <div className={`flex justify-between text-xl font-medium collapse-title `}>
        {title}
        <BsChevronUp className={`${open ? 'rotate-180' : ''}`} />
      </div>
      <div className="collapse-content">
        {content}
      </div>
    </div>
  )
}

const supportedInstallation = ['Javascript', 'Shopify', 'Wordpress', 'Woocommerce'] as const
export type SupportedInstallation = (typeof supportedInstallation)[number]

const supportedInstallations: Record<SupportedInstallation, ReactNode> = {
  'Javascript': <BiLogoJavascript />,
  'Shopify': <FaShopify className='text-xl text-green-600' />,
  'Wordpress': <BiLogoWordpress />,
  'Woocommerce': <SiWoocommerce className='text-6xl' />
} as const

export default function Page() {
  const t = useTranslations('dash.settings.installation')
  const [user] = useAuthContext()
  const orgId = user?.orgId ?? ''
  const configurationQuery = useConfigurationQuery(orgId);
  const orgQuery = useOrgQuery(orgId);
  const updateConfigurationMut = useUpdateConfigurationMut(orgId);
  const [tab, setTab] = useState<SupportedInstallation>('Javascript')
  const [value, copy] = useCopyToClipboard()

  const { register, handleSubmit, setValue, getValues, control, formState: { errors } } = useForm<ConfigLiveChatAppearance>({ defaultValues: { ...configurationQuery.data?.channels?.liveChat?.appearance }, resolver });
  const onSubmit = handleSubmit(async (data) => {
    const updateBody: UpdateConfiguration = {
      ...configurationQuery.data, channels: {
        ...configurationQuery?.data?.channels, liveChat: { ...configurationQuery?.data?.channels?.liveChat, appearance: { ...data, widgetAppearance: { ...data.widgetAppearance, backgroundColor: '' }, } }
      }
    }
    await updateConfigurationMut.mutateAsync([orgId, updateBody])
  })

  const { installed, jsInstallUrl } = { ...configurationQuery.data?.channels?.liveChat?.installation };


  const renderTab = () => {
    switch (tab) {
      case 'Javascript': {

        return (
          <div className='flex flex-col gap-y-2'>
            {t(`Paste this code snippet just before the </body> tag`)}
            <div className="mockup-code">
              <pre data-prefix="$"><code>{jsInstallUrl}</code></pre>
            </div>
            <button className='normal-case btn btn-primary btn-wide btn-outline gap-x-2' onClick={() => copy(jsInstallUrl ?? '')}>
              <BsClipboard />{t('Copy to clipboard')}
            </button>
          </div>
        )
      }
      case 'Shopify': {
        return (
          <div className='flex flex-col gap-y-2'>
            {t('Provide your Shopify domain to connect with eChat')}
            <div className="w-full max-w-xs form-control">
              <label className="label">
                <span className="label-text">{t('Your store name')}</span>
              </label>
              <div className='flex join'>
                <input type="text" placeholder="Type here" className="w-64 max-w-lg rounded-r-none input input-bordered join-item" />
                <input type="text" placeholder="Type here" className="max-w-xs bg-white rounded-l-none input input-bordered join-item" value={'.myshopify.com'} disabled />
              </div>
            </div>
            <button className='normal-case btn btn-primary btn-outline gap-x-2 btn-wide' onClick={() => copy(jsInstallUrl ?? '')}>
              <FaShopify className='text-xl text-green-600' />{t('Connect to')} Shopify
            </button>
          </div>
        )
      }
      case 'Wordpress':
      case 'Woocommerce': {
        return <div>
          <ul className='list-decimal'>
            {t('Wordpress installation instructions').split('\n').map((step) =>
              <li>
                {step}
              </li>
            )}
          </ul>
        </div>
      }
    }
  }


  return (
    <form className='bg-white' onSubmit={onSubmit}>
      <div className='w-full border-b-[1px] mb-5 text-3xl '>
        <h3>
          {installed ? <div className='flex place-items-center'>
            < FcCheckmark /> {t('The chat code is installed')}
          </div> : <div className='flex place-items-center'>
            <FcCancel />{t('The chat code is not installed properly')}
          </div>}
        </h3>
      </div>
      <div className='grid grid-cols-12'>
        <ul className="w-56 col-span-3 bg-white menu border-r-[1px]">
          {Object.entries(supportedInstallations).map(([installationTab, icon]) =>
            installationTab === tab ? <li><a className="active" onClick={() => setTab(installationTab as SupportedInstallation)}>{icon}{installationTab}</a></li> :
              <li onClick={() => setTab(installationTab as SupportedInstallation)}><a>{icon}{installationTab}</a></li>
          )}
        </ul>
        <div className='col-span-9'>
          {renderTab()}
        </div>
      </div>
    </form >
  )
}