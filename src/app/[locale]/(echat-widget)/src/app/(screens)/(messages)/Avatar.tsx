import { EntityItem } from 'electrodb';

import { DynamicBackground } from '../../../../../(helpers)/DynamicBackground';
import { useConfigurationQuery } from '../../../../../(hooks)/queries';
import { Configuration } from '../../../../../../../../stacks/entities/configuration';
import { ConversationItem } from '../../../../../../../../stacks/entities/conversation';
import { Message } from '../../../../../../../../stacks/entities/message';

interface Props {
  conversationItem?: ConversationItem,
  message?: EntityItem<typeof Message>
}

export const Avatar: React.FC<Props> = ({ conversationItem, message }) => {
  const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? ''
  const configuration = useConfigurationQuery(orgId);
  return (
    <div className={`avatar w-12 h-12 background rounded-full p-2 ring-2 ring-primary ${message?.sender === 'operator' && conversationItem?.operator.online ? 'online' : 'offline'}`} >
      {configuration.data && <DynamicBackground configuration={configuration.data as EntityItem<typeof Configuration>} />}
      {message?.sender === 'operator' ? <img src={conversationItem?.operator.profilePicture} /> : <img src={configuration?.data?.channels?.liveChat?.appearance?.widgetAppearance?.botLogo} />}
    </div >

  )
}