import { EntityItem } from 'electrodb';

import { useOrgQuery } from '@/app/(actions)/queries/useOrgQuery';
import { DynamicBackground } from '@/app/(helpers)/DynamicBackground';
import { Configuration } from '@/entities/configuration';
import { ConversationItem } from '@/entities/conversation';
import { Message } from '@/entities/message';

import { useConfigurationQuery } from '../../../app/(actions)/queries/useConfigurationQuery';

interface Props {
  conversationItem?: ConversationItem,
  message?: EntityItem<typeof Message>
}

export const Avatar: React.FC<Props> = ({ conversationItem, message }) => {
  const org = useOrgQuery()
  const orgId = org?.data?.orgId ?? ''
  const configuration = useConfigurationQuery(orgId);
  return (
    <div className={`avatar w-12 h-12 background rounded-full p-2 ring-2 ring-info ${message?.sender === 'operator' && conversationItem?.operator.online ? 'online' : ''}`} >
      {configuration.data && <DynamicBackground configuration={configuration.data as EntityItem<typeof Configuration>} />}
      {message?.sender === 'operator' ? <img src={conversationItem?.operator.profilePicture} /> : <img src={configuration?.data?.channels?.liveChat?.appearance?.widgetAppearance?.botLogo} />}
    </div >

  )
}