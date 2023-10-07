import { useTranslations } from 'next-intl';
import { FC, use, useMemo } from 'react';
import { FcDownload, FcIdea, FcPositiveDynamic } from 'react-icons/fc';
import { useScreen } from 'usehooks-ts';

import { useAuthContext } from '../../(hooks)/AuthProvider';
import { useBotsQuery } from '../../(hooks)/queries/useBotsQuery';

export const BotsMenu: FC = () => {
  const tDash = useTranslations('dash')
  const tBots = useTranslations('dash.bots')

  const [sessionOperator] = useAuthContext();

  const orgId = sessionOperator?.orgId ?? ''
  const bots = useBotsQuery([orgId]);
  useBotMutation(())

  const render = useMemo(() => {
    < div className="flex justify-between w-full h-full bg-white " >
      <div className="flex flex-col w-full h-full place-items-center ">
        <div
          className={`bg-white flex flex-col gap-y-2 place-items-center animated-flip-down w-full justify-center  text-xl font-semibold p-3 gap-x-2   `}
        >

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
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
                  <tr>
                    <th>
                      <label>
                        <input type="checkbox" className="checkbox" />
                      </label>
                    </th>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="w-12 h-12 mask mask-squircle">
                            <img src="/tailwind-css-component-profile-2@56w.png" alt="Avatar Tailwind CSS Component" />
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">Hart Hagerty</div>
                          <div className="text-sm opacity-50">United States</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <input type="checkbox" className="toggle" checked={bot.checked} />
                    </td>
                    <td>Purple</td>
                    <th>
                    </th>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Job</th>
                  <th>Favorite Color</th>
                  <th></th>
                </tr>
              </tfoot>

            </table>
          </div>
        </div >
      </div >
    </div >
  }, [])

}