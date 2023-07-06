'use client';

import ct from 'countries-and-timezones';
import { flag } from 'country-emoji';
import LocaleCode from 'locale-code';
import { useFormatter, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { FC, useState } from 'react';
import { isMobile } from 'react-device-detect';
import { BiChevronRight } from 'react-icons/bi';
import { BsLaptop } from 'react-icons/bs';
import { FcGlobe } from 'react-icons/fc';

import { useDashStore } from '../(actions)/useDashStore';
import { useOperatorSession } from '../../(helpers)/useOperatorSession';
import { useConversationItemQuery } from '../../(hooks)/queries/useConversationItemQuery';
import { useVisitorsQuery } from '../../(hooks)/queries/useVisitorsQuery';

type InfoTabs = 'Profile' | 'Visited Pages' | 'Notes';

const visitedPagesTabLabel = 'Visited Pages';
const profile = 'Profile';
const notesTab = 'Notes';

const fetchingSkeleton = (
  <div className="flex flex-col w-full p-2 my-2 animate-pulse rounded-3xl gap-y-2">
    {[...Array(10)].map(() => (
      <div className="flex w-full place-items-center animate-fade-left">
        <div className='flex flex-col w-full gap-y-2'>
          <div className="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-full" />
          <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700" />
        </div>
        <BiChevronRight className="text-4xl text-gray-300 dark:text-gray-600 justify-right" />
      </div>))}
  </div>
)



export const VisitorView: FC = () => {
  const t = useTranslations('app.inbox.chat');
  const tDash = useTranslations('dash');
  const [currentTab, setCurrentTab] = useState<InfoTabs>('Profile');
  const { conversationState, setConversationState } = useDashStore();
  const { relativeTime } = useFormatter();
  const operatorSession = useOperatorSession();
  const visitorsQuery = useVisitorsQuery(operatorSession.operatorId);
  const { orgId } = operatorSession
  const searchParams = useSearchParams();
  const conversationId = searchParams?.get('conversationId')
  const conversationItemQuery = useConversationItemQuery(orgId, conversationId ?? '')
  const conversationItem = conversationItemQuery.data?.[0]

  return (
    <div className="flex justify-between w-full h-full rounded-3xl">
      <div className="flex flex-col w-full h-full place-items-center ">
        <div
          className={` bg-white flex  normal-case border-b-[1px] flex-col  place-items-center animated-flip-down w-full justify-center rounded-t-lg text-xl font-semibold gap-x-2   `}
        >
          <div className='flex justify-end w-full place-items-center'>
            <div className='flex place-items-center'>
            </div>
            <div className='flex justify-end place-items-center'>
              <ul>
                {visitorsQuery.data.map((visitor) =>
                  <li className='border-b-[1px] flex-row flex'>
                    {visitor.name}
                    {visitor.email}
                    {relativeTime(visitor?.visitedPages?.datetimeAtVist ?? 0)}
                  </li>
                )}

                <div className="overflow-x-auto">
                  <table className="table">
                    {/* head */}
                    <thead>
                      <tr>
                        <th>{t('Name')}</th>
                        <th>{t('Entered')}</th>
                        <th>{`${<FcGlobe />}${<BsLaptop />}`}</th>
                        <th>{t('Last Visited Page')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* row 1 */}
                      <tr>
                        <th>1</th>
                        <td>Cy Ganderton</td>
                        <td>Quality Control Specialist</td>
                        <td>Blue</td>
                      </tr>
                      {/* row 2 */}
                      <tr className="hover">
                        <th>2</th>
                        <td>Hart Hagerty</td>
                        <td>Desktop Support Technician</td>
                        <td>Purple</td>
                      </tr>
                      {/* row 3 */}
                      <tr>
                        <th>3</th>
                        <td>Brice Swyre</td>
                        <td>Tax Accountant</td>
                        <td>Red</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </ul>
            </div>

          </div>
        </div>
        <div
          className={`flex flex-col place-items-center  w-full bg-white h-screen  overflow-y-scroll mx-2 `}
        >
        </div>
      </div>
    </div>
  );