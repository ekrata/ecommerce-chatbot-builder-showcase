import { EntityItem } from 'electrodb';
import { useOrgQuery } from 'src/app/(actions)/queries/useOrgQuery';
import { DynamicBackground } from 'src/app/(helpers)/DynamicBackground';

import { Configuration } from '@/entities/configuration';
import { ConversationItem } from '@/entities/conversation';
import { Message } from '@/entities/message';

import { useConfigurationQuery } from '../../../app/(actions)/queries/useConfigurationQuery';

interface Props {
  conversationItem?: ConversationItem,
  message?: EntityItem<typeof Message>,
  toggleIndicator?: boolean,
  width?: string
}

export const Avatar: React.FC<Props> = ({ conversationItem, message, toggleIndicator = false }) => {
  const org = useOrgQuery()
  const orgId = org?.data?.orgId ?? ''
  const configuration = useConfigurationQuery(orgId);
  return (
    <div className={`avatar indicator   align-center items-center place-items-center align-center content-center background rounded-full p-1 ring-1 ring-info ${message?.sender === 'operator' && conversationItem?.operator.online ? 'online' : ''}`} >
      {toggleIndicator &&
        <span
          data-testid="status-badge"
          className={`indicator-item  badge-success ring-white ring-2 badge-xs text-white dark:text-default rounded-full ${!message?.sentAt
            ? 'mx-0 my-0 indicator-bottom animate-bounce'
            : 'my-2 mx-2 indicator-top'
            }`}
        >
          <span className='animate-pulse '>
            ...
            {/* {!message?.sentAt ? '...' : ''} */}
          </span>
        </span>
      }
      {configuration.data && <DynamicBackground configuration={configuration.data as EntityItem<typeof Configuration>} />}
      <div className={` w-8 `}>
        {message?.sender === 'operator' ? <img src={conversationItem?.operator.profilePicture} /> : <img src={configuration?.data?.channels?.liveChat?.appearance?.widgetAppearance?.botLogo} />}
      </div>
    </div>

  )
}