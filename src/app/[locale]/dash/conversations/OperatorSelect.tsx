'use client';

import { getCookie } from 'cookies-next';
import { t } from 'msw/lib/glossary-de6278a9';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { BsPeopleFill, BsPerson, BsRobot } from 'react-icons/bs';

import { useDashStore } from '../(actions)/useDashStore';
import { useOperatorSession } from '../../(helpers)/useOperatorSession';
import { useOperatorsQuery } from '../../(hooks)/queries/useOperatorsQuery';

export const OperatorSelect: React.FC = () => {
  const t = useTranslations('dash');
  const sessionOperator = useOperatorSession();
  const { conversationOperatorView, setConversationOperatorView } = useDashStore()
  const operators = useOperatorsQuery(sessionOperator.orgId)

  // if undefined, set to sessionOperator
  useEffect(() => {
    !conversationOperatorView && setConversationOperatorView(sessionOperator?.operatorId)
  }, [])

  const displaySelectedAvatar = () => {
    if (conversationOperatorView === 'all') {
      <BsPeopleFill />
    }
    else if (conversationOperatorView === 'bots') {
      <BsRobot />
    }
    else {
      // find selectedOperatorView id in operators query
      const operator = operators?.data?.find((operator) => operator?.operatorId === conversationOperatorView);
      return operator?.profilePicture ? <img src={operator?.profilePicture}></img> : <BsPerson />
    }
  }

  return (
    <details className="mb-32 dropdown">
      <summary className="m-1 btn">
        <div className={`avatar online`}>
          <div className="w-6 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            {displaySelectedAvatar()}
          </div>
        </div>
      </summary>
      <ul className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
        <li onClick={() => setConversationOperatorView(sessionOperator.operatorId)}>
          <a>
            <div className={`avatar online`}>
              <div className="w-6 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={sessionOperator.profilePicture} />
              </div>
            </div>
            <p>{sessionOperator.name ?? sessionOperator.email} ({t('You')})</p>
          </a>
        </li>
        {sessionOperator.permissionTier !== 'operator' && <li onClick={() => setConversationOperatorView('all')}>
          <a>
            <div className={`avatar`}>
              <div className="w-6 rounded-full">
                <BsPeopleFill />
              </div>
            </div>
            <p>{t('All conversations')}</p>
          </a>
        </li>}
        {sessionOperator.permissionTier !== 'operator' && <li onClick={() => setConversationOperatorView('bots')}>
          <a>
            <div className={`avatar`}>
              <div className="w-6 rounded-full">
                <BsRobot />
              </div>
            </div>
            <p>{t('Bots in action')}</p>
          </a>
        </li>}
        {operators?.data?.map((operator) => (
          operator.operatorId !== sessionOperator.operatorId &&
          <li className='flex' onClick={() => setConversationOperatorView(operator.operatorId)}>
            <a>
              <div className={`avatar ${operator.online ? 'online' : 'offline'}`}>
                <div className="w-6 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={sessionOperator.profilePicture} />
                </div>
              </div>
              <p>
                {operator.name ?? operator.email}
              </p>
              <input type="radio" name="radio-2" className="justify-end radio radio-primary" checked={key === conversationOperatorView} />
            </a>
          </li>
        ))}
      </ul>
    </details>
  )

}