import { useTranslations } from 'next-intl';
import { useState } from 'react';

export type NodeMenuState = '' | 'trigger' | 'condition' | 'action'

export const NodeSelector: React.FC = () => {
  const t = useTranslations('dash.bots')
  const [nodeMenuState, setNodeMenuState] = useState<NodeMenuState>('')

  return (
    <div className="hover:w-64">
      {!nodeMenuState &&
        <ul>
          <li onClick={() => setNodeMenuState('trigger')}>{t('Trigger')}</li>
          <li onClick={() => setNodeMenuState('condition')}>{t('Condition')}</li>
          <li onClick={() => setNodeMenuState('action')}>{t('Action')}</li>
        </ul>
      }
    </div>
  )
}