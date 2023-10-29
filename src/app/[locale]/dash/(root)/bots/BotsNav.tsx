'use client'
import { Link, useTranslations } from 'next-intl';
import { FC } from 'react';
import { BsMenuButtonWideFill } from 'react-icons/bs';
import { FcDownload, FcIdea, FcList, FcPositiveDynamic } from 'react-icons/fc';
import { useScreen } from 'usehooks-ts';

export const BotsNav: FC = () => {
  const tDash = useTranslations('dash')
  const tBots = useTranslations('dash.bots')


  return (
    < div className="flex justify-between w-full h-full bg-white " >
      <div className="flex flex-col w-full h-full bg-white place-items-center">
        <div
          className={`bg-white flex flex-col gap-y-2 place-items-center  w-full justify-start text-start  text-xl font-semibold p-3 gap-x-2   `}
        >
          <div
            className={`flex flex-col bg-white  justify-start  w-full  overflow-y-scroll   `}
          >
            <h2>{tBots('My chatbots')}</h2>
            <ul className='justify-start mb-4 ml-2 text-lg font-normal bg-white animated-flip-down menu dropdown-content' >
              <li><Link className='flex justify-start text-lg place-items-center gap-x-2' href={{ pathname: '/all' }}><FcPositiveDynamic />{tBots('Grow sales')}</Link></li>
              <li><Link className='flex justify-start place-items-center gap-x-2' href={{ pathname: '/generate-leads' }} ><FcDownload />{tBots('Generate leads')}</Link></li>
              <li><Link className='flex justify-start place-items-center gap-x-2' href={{ pathname: '/resolve-issues' }}><FcIdea />{tBots('Resolve issues')}</Link></li>
              <li><Link className='flex justify-start place-items-center gap-x-2' href={{ pathname: '/all' }}>{tDash('All')}</Link></li>
            </ul>
            <h2>{tBots('Templates')}</h2>
            <ul className='justify-start mb-4 ml-2 text-lg font-normal animated-flip-down menu dropdown-content' >
              <li><Link className='flex justify-start text-lg place-items-center gap-x-2' href={{ pathname: "/templates/strategies" }}><FcList />{tBots('Strategies')}</Link></li>
              <li><Link className='flex justify-start text-lg place-items-center gap-x-2' href={{ pathname: "/templates/grow-sales" }}><FcPositiveDynamic />{tBots('Grow sales')}</Link></li>
              <li><Link className='flex justify-start place-items-center gap-x-2' href={{ pathname: "/templates/generate-leads" }} ><FcDownload />{tBots('Generate leads')}</Link></li>
              <li><Link className='flex justify-start place-items-center gap-x-2' href={{ pathname: "/templates/generate-leads" }}><FcIdea />{tBots('Resolve issues')}</Link></li>
            </ul>
          </div>
        </div>
      </div >
    </div >
  )
}