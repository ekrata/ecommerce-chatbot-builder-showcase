import { useTranslations } from 'next-intl';
import { FC } from 'react';
import { FcDownload, FcIdea, FcPositiveDynamic } from 'react-icons/fc';
import { useScreen } from 'usehooks-ts';

export const BotsMenu: FC = () => {
  const tDash = useTranslations('dash')
  const tBots = useTranslations('dash.bots')


  return (
    < div className="flex justify-between w-full h-full bg-white " >
      <div className="flex flex-col w-full h-full place-items-center ">
        <div
          className={`bg-white flex flex-col gap-y-2 place-items-center animated-flip-down w-full justify-center  text-xl font-semibold p-3 gap-x-2   `}
        >
          <div
            className={`flex flex-col bg-white place-items-center  w-full  overflow-y-scroll mx-2 `}
          >
            <h2>{tBots('My chatbots')}</h2>
            <ul className='' >
              <li><h3><FcPositiveDynamic />{tBots('Grow sales')}</h3></li>
              <li><h3><FcDownload />{tBots('Generate leads')}</h3></li>
              <li><h3><FcIdea />{tBots('Resolve issues')}</h3></li>
              <li><h3>{tDash('All')}</h3></li>
            </ul>
            <h2>{tBots('Templates')}</h2>
            <ul className='' >
              <li><h3>{tBots('Strategies')}</h3></li>
              <li><h3>{tBots('Grow sales')}</h3></li>
              <li><h3>{tBots('Generate leads')}</h3></li>
              <li><h3>{tBots('Resolve issues')}</h3></li>
            </ul>
          </div>
        </div>
      </div >
    </div >
  )
}