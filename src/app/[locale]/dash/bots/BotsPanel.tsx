import { useTranslations } from 'next-intl';
import { FC, use, useMemo, useRef } from 'react';
import { BsRobot, BsThreeDotsVertical } from 'react-icons/bs';
import { FcDownload, FcIdea, FcPositiveDynamic } from 'react-icons/fc';
import { useHover, useScreen } from 'usehooks-ts';

import { ArticleCategory } from '@/entities/article';

import { useAuthContext } from '../../(hooks)/AuthProvider';
import { useCreateBotMut } from '../../(hooks)/mutations/useCreateBotMut';
import { useDeleteBotMut } from '../../(hooks)/mutations/useDeleteBotMut';
import { useUpdateBotMut } from '../../(hooks)/mutations/useUpdateBotMut';
import { useBotsQuery } from '../../(hooks)/queries/useBotsQuery';
import { BotActionMenu } from './BotActionMenu';

interface Props {
  title: ArticleCategory | 'All'
}

export const BotsPanel: FC<Props> = ({ title }) => {
  const tDash = useTranslations('dash')
  const tBots = useTranslations('dash.bots')

  const [sessionOperator] = useAuthContext();

  const orgId = sessionOperator?.orgId ?? ''
  const bots = useBotsQuery([orgId]);
  const deleteBotMut = useDeleteBotMut(orgId)
  const createBotMut = useCreateBotMut(orgId)
  const updateBotMut = useUpdateBotMut(orgId)


  const hoverRef = useRef(null)
  const isHover = useHover(hoverRef)

  const render = useMemo(() => {
    return (
      < div className="flex justify-between w-full h-full bg-white " >
        <div className='flex justify-between'>
          <h2>{title === 'All' ? tDash('All') : tDash(`articleCategory.${title}`)}</h2>
          <div className="flex gap-x-2" >
            <button className="flex btn btn-outline">
              <BsRobot />
              {tBots('Create new bot')}
            </button>
            <button className="flex btn btn-primary">
              <BsRobot />
              {tBots('Create new bot from template')}
            </button>
          </div>
        </div>
        <div className="flex flex-col w-full h-full place-items-center ">
          <div
            className={`bg-white flex flex-col gap-y-2 place-items-center animated-flip-down w-full justify-center  text-xl font-semibold p-3 gap-x-2   `}
          >
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr >
                    <th>
                      <label>
                        <input type="checkbox" className="checkbox" />
                      </label>
                    </th>
                    <th>{tDash('Name')}</th>
                    <th>{tBots('Triggered')}</th>
                    <th>{tBots('Engagement')}</th>
                    <th>{tBots('Satisfaction')}</th>
                    <th>{tDash('Active')}</th>
                  </tr>
                </thead>
                <tbody>
                  {bots?.data?.map((bot) => (
                    <tr ref={hoverRef}>
                      <td>
                        <div className="flex items-center space-x-3">
                          <h5 className='text-semi-bold'>
                            {bot.name}
                          </h5>
                        </div>
                      </td>
                      <td>
                        <p>
                          {bot?.triggeredCount}
                        </p>
                      </td>
                      <td>
                        <p>
                          {bot?.helpfulnessPercent}
                        </p>
                      </td>
                      <td>
                        <p>
                          {bot?.handoffPercent}
                        </p>
                      </td>
                      <td>
                        <input type="checkbox" className="toggle" checked={bot?.active} />
                      </td>
                      <th>
                        {isHover && (
                          <details className='mb-32 dropdown'>
                            <summary className="m-1 "><BsThreeDotsVertical /></summary>
                            <div className='shadow menu dropdown-content'>
                              <BotActionMenu bot={bot} />
                            </div>
                          </details>
                        )}
                      </th>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div >
        </div >
      </div >
    )
  }, [bots?.dataUpdatedAt])

  return render
}