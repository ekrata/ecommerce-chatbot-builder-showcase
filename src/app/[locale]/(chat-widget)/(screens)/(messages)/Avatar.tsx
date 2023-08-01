import { EntityItem } from 'electrodb';

import { ConversationItem } from '@/entities/conversation';
import { Message } from '@/entities/message';

import { DynamicBackground } from '../../../(helpers)/DynamicBackground';
import { useConfigurationQuery } from '../../../(hooks)/queries';

interface Props {
  conversationItem?: ConversationItem,
  message?: EntityItem<typeof Message>
}


export const Avatar: React.FC<Props> = ({ conversationItem, message }) => {
  const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? ''
  const configuration = useConfigurationQuery(orgId);
  const { widgetAppearance } = { ...configuration.data?.channels?.liveChat?.appearance }
  return (
    <div className={`avatar w-12 h-12 background rounded-full p-2 ring-2 ring-primary ${message?.sender === 'operator' && conversationItem?.conversation.operator.online ? 'online' : 'offline'}`}>
      {configuration.data && <DynamicBackground configuration={configuration.data} />}
      {message?.sender === 'operator' ? <img src={conversationItem?.conversation.operator.profilePicture} /> : <img src={widgetAppearance?.botLogo} />}
    </div>

  )
}