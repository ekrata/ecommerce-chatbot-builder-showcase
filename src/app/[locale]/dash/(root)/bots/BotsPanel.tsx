'use client'
import { EntityItem } from 'electrodb';
import { Link, useLocale, useTranslations } from 'next-intl';
import router from 'next/router';
import { FC, use, useEffect, useMemo, useRef } from 'react';
import { BiEdit, BiExport, BiTrash } from 'react-icons/bi';
import {
    BsChatLeftDots, BsFileBarGraph, BsPersonSlash, BsRobot, BsThreeDotsVertical
} from 'react-icons/bs';
import { FaRegClone } from 'react-icons/fa';
import { GrTest } from 'react-icons/gr';
import { TbRobotOff } from 'react-icons/tb';

import { Bot, BotCategory } from '@/entities/bot';

import { useAuthContext } from '../../../(hooks)/AuthProvider';
import { useCreateBotMut } from '../../../(hooks)/mutations/useCreateBotMut';
import { useDeleteBotMut } from '../../../(hooks)/mutations/useDeleteBotMut';
import { useUpdateBotMut } from '../../../(hooks)/mutations/useUpdateBotMut';
import { useBotsQuery } from '../../../(hooks)/queries/useBotsQuery';

interface Props {
  title: BotCategory | 'All'
}

export const BotsPanel: FC<Props> = ({ title }) => {
  const tDash = useTranslations('dash')
  const tBots = useTranslations('dash.bots')

  const [operatorSession] = useAuthContext();
  const locale = useLocale()

  const orgId = operatorSession?.orgId ?? ''
  const skeletonLength = 6
  const bots = useBotsQuery([orgId]);
  const deleteBotMut = useDeleteBotMut(orgId)
  const createBotMut = useCreateBotMut(orgId)
  const updateBotMut = useUpdateBotMut(orgId)

  useEffect(() => {
    if (operatorSession?.orgId) {
      bots.refetch()
    }
  }, [operatorSession?.orgId])

  return (
    < div className="flex flex-col justify-between w-full h-full p-2 bg-white " >
      <div className='flex flex-row justify-between'>
        <h2 className='text-2xl font-semibold'>{title === 'All' ? tDash('All') : tDash(`bots.categories.${title}`)}</h2>
        <div className="flex gap-x-2" >
          <button className="flex normal-case btn btn-sm btn-outline gap-x-2">
            <BsRobot />
            {tBots('Create new bot')}
          </button>
          <button className="flex normal-case btn btn-sm btn-primary gap-x-2">
            <BsRobot />
            {tBots('Create new bot from template')}
          </button>
        </div>
      </div>
      <div className="flex flex-col w-full h-full place-items-center">
        <div
          className={`bg-white flex flex-col gap-y-2 place-items-center animated-flip-down w-full justify-center  text-xl font-semibold p-3 gap-x-2   `}
        >
          <div className="w-full h-full max-h-screen min-h-screen overflow-x-auto">
            <table className="table w-full table-lg">
              <thead className=''>
                <tr className='bg-white border-b-[1px] normal-case text-xl'>
                  <th className='text-lg normal-case bg-transparent'>{tDash('Name')}</th>
                  <th className='text-lg normal-case bg-transparent'>{tBots('Triggered')}</th>
                  <th className='text-lg normal-case bg-transparent'>{tBots('Engagement')}</th>
                  <th className='text-lg normal-case bg-transparent'>{tBots('Satisfaction')}</th>
                  <th className='text-lg normal-case bg-transparent'>{tDash('Active')}</th>
                </tr>
              </thead>
              <tbody className='h-full animate-fade-left'>
                {(bots?.isFetching ? [...Array(skeletonLength).keys()] : bots?.data)?.map((data) => {
                  const bot = (data as EntityItem<typeof Bot>)
                  return (
                    <tr className='w-full text-lg font-normal group hover:cursor-pointer'
                    >
                      <td className='group-hover:bg-gray-300 '>
                        <Link href={{ pathname: `/dash/bots/${bot?.botId}` }}>
                          <div className="flex items-center space-x-3">
                            <h5 className='text-semi-bold'>
                              {bots?.isFetching ? <div className="h-2.5 animate-pulse bg-gray-200 rounded-full dark:bg-gray-700 w-32 mb-2.5"></div> : bot?.name}
                            </h5>
                          </div>
                        </Link>
                      </td>
                      <td className='group-hover:bg-gray-300'>
                        <Link href={{ pathname: `/dash/bots/${bot?.botId}` }}>
                          <p>
                            {bots?.isFetching ? <div className="h-2.5 animate-pulse bg-gray-200 rounded-full dark:bg-gray-700 w-8 mb-2.5"></div> : bot?.triggeredCount?.toFixed()}
                          </p>
                        </Link>
                      </td>
                      <td className='group-hover:bg-gray-300'>
                        <Link href={{ pathname: `/dash/bots/${bot?.botId}` }}>

                          <p>
                            {bots?.isFetching ? <div className="h-2.5 animate-pulse  bg-gray-200 rounded-full dark:bg-gray-700 w-8 mb-2.5"></div> : bot?.helpfulnessPercent?.toLocaleString(locale, { style: "percent" })}
                          </p>

                        </Link>
                      </td>
                      <td className='group-hover:bg-gray-300'>
                        <Link href={{ pathname: `/dash/bots/${bot?.botId}` }}>

                          <p>
                            {bots?.isFetching ? <div className="h-2.5 animate-pulse -z-10  bg-gray-200 rounded-full dark:bg-gray-700 w-8 mb-2.5"></div> : bot?.handoffPercent?.toLocaleString(locale, { style: "percent" })}
                          </p>

                        </Link>
                      </td>
                      <td className='group-hover:bg-gray-300'>
                        <Link href={{ pathname: `/dash/bots/${bot?.botId}` }}>
                          {bots?.isFetching ? <div className="h-2.5 animate-pulse -z-10 bg-gray-200 rounded-full dark:bg-gray-700 w-8 mb-2.5"></div> : <input type="checkbox" className="toggle toggle-primary" defaultChecked={bot?.active} />}
                        </Link>
                      </td>
                      <td className='w-full group-hover:bg-gray-300 dropdown dropdown-end'>
                        <label tabIndex={0} className={`invisible  btn btn-ghost ${!bots?.isFetching && 'hover:bg-black group-hover:visible hover:text-white'}`}><BsThreeDotsVertical className='text-xl' /></label>
                        <ul tabIndex={0} className="z-[1]  justify-start space-y-0 bg-white shadow-xl menu dropdown-content rounded-box gap-y-2" >
                          <p className='border-b-[1px] py-1 justify-center rounded-t-box text-center bg-black text-white'>{tBots('Bot actions')}</p>
                          <li className='flex flex-row justify-start '>
                            <a className='w-full'>
                              <BiEdit />
                              {tDash('Edit')}
                            </a>
                          </li>
                          <li className='flex flex-row justify-start '>
                            <a className='w-full'>
                              <FaRegClone />
                              {tDash('Clone')}
                            </a>
                          </li>
                          <li className='flex flex-row'>
                            <a className='w-full'>
                              <BiExport />
                              {tDash('Export')}
                            </a>
                          </li>
                          <li className='flex flex-row'>
                            <a className='w-full'>
                              <BiTrash />
                              {tDash('Delete')}
                            </a>
                          </li>
                          <li className='flex flex-row'>
                            <a className='w-full'>
                              <BsFileBarGraph />
                              {tBots('View statistics')}
                            </a>
                          </li>
                          <li className='flex flex-row'>
                            <a className='w-full'>
                              <GrTest />
                              {tBots('Test & validate bot')}
                            </a>
                          </li>
                          <li className='flex flex-row'>
                            <a className='justify-between w-full'>
                              <div className='flex place-items-center gap-x-2'>
                                <BsPersonSlash />
                                {tBots('Start while operators are offline')}
                              </div>
                              <input type="checkbox" className=" toggle toggle-primary" defaultChecked={bot?.startWhileOperatorsAreOffline} />
                            </a>
                          </li>
                          <li className='flex flex-row'>
                            <a className='justify-between w-full'>
                              <div className='flex place-items-center gap-x-2'>
                                <BsChatLeftDots />
                                {tBots('Start while an operator is handling another conversation')}
                              </div>
                              <input type="checkbox" className="toggle toggle-primary" defaultChecked={bot?.startWhileAnOperatorIsHandlingAnotherConversation} />
                            </a>
                          </li>
                          <li className='flex flex-row'>
                            <a className='justify-between w-full'>
                              <div className='flex place-items-center gap-x-2'>
                                <TbRobotOff />
                                {tBots('Start when another bot is running')}

                              </div>
                              <input type="checkbox" className="toggle toggle-primary" defaultChecked={bot?.startWhenAnotherBotRunning} />
                            </a>
                          </li>
                        </ul>
                      </td>
                    </tr>
                  )
                }
                )}
              </tbody>
            </table>
          </div>
        </div >
      </div >
    </div >
  )

}