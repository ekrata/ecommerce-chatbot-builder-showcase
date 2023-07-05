'use client';

import { getCookie } from 'cookies-next';
import { t } from 'msw/lib/glossary-de6278a9';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { BsPeopleFill, BsPerson, BsRobot } from 'react-icons/bs';
import { FaChevronDown } from 'react-icons/fa';

import { useDashStore } from '../(actions)/useDashStore';
import { useOperatorSession } from '../../(helpers)/useOperatorSession';
import { useOperatorsQuery } from '../../(hooks)/queries/useOperatorsQuery';

interface Props {
  dropdownPosition?: 'end'
}

export const OperatorSelect: React.FC<Props> = ({ dropdownPosition }) => {
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
      return <div className={`avatar place-items-center`}>
        <div className="w-8 h-8 text-2xl rounded-full place-items-center ring ring-primary ring-offset-base-100 ring-offset-2">
          <BsPeopleFill className='w-full h-full text-2xl' />
        </div>
      </div>
    }
    else if (conversationOperatorView === 'bots') {
      return <div className={`avatar place-items-center`}>
        <div className="w-8 h-8 text-2xl rounded-full place-items-center ring ring-primary ring-offset-base-100 ring-offset-2">
          <BsRobot className='w-full h-full text-2xl' />
        </div>
      </div>
    }
    else if (conversationOperatorView === sessionOperator.operatorId) {
      return sessionOperator?.profilePicture ? <div className={`avatar ${sessionOperator.online ? 'online' : 'offline'} place-items-center`}>
        <div className="w-8 h-8 text-2xl rounded-full place-items-center ring ring-primary ring-offset-base-100 ring-offset-2">
          <img className='w-8 h-8' width={8} height={8} src={sessionOperator?.profilePicture}></img>
        </div>
      </div> : <BsPerson />
    }
    else {
      // find selectedOperatorView id in operators query
      const operator = operators?.data?.find((operator) => operator?.operatorId === conversationOperatorView);
      return operator?.profilePicture ?
        <div className={`avatar ${operator.online ? 'online' : 'offline'} place-items-center`}>
          <div className="w-8 h-8 text-2xl rounded-full place-items-center ring ring-primary ring-offset-base-100 ring-offset-2">
            <img className='w-8 h-8' width={8} height={8} src={operator?.profilePicture}></img>
          </div>
        </div>
        : <BsPerson />
    }
  }


  return (
    <details className={`w-full h-full dropdown text-sm ${dropdownPosition ? `dropdown-${dropdownPosition}` : ''}`}>
      <summary className="flex flex-row normal-case btn btn-ghost place-items-center gap-x-2">
        {displaySelectedAvatar()}
        <FaChevronDown className='text-gray-400'></FaChevronDown>
      </summary>
      <ul className="p-2 shadow menu dropdown-content max-h-screen-2/3 overflow-y-scroll z-[1] bg-base-100 rounded-box w-80">
        <li>
          <a>
            <input type="radio" name={`radio-${sessionOperator.operatorId}`} className="form-control radio-primary radio-xs" checked={conversationOperatorView === sessionOperator.operatorId} onClick={() => {
              if (sessionOperator.operatorId === conversationOperatorView) {
                setConversationOperatorView()
              } else {
                setConversationOperatorView(sessionOperator.operatorId)
              }
            }} />
            <div className={`avatar ${sessionOperator.online ? 'online' : 'offline'}`}>
              <div className="w-6 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={sessionOperator.profilePicture} />
              </div>
            </div>
            <p>{sessionOperator.name ?? sessionOperator.email} ({t('You')})</p>
          </a>
        </li>
        {sessionOperator.permissionTier !== 'operator' &&
          <li>
            <a className='text-sm font-normal place-items-center'>
              <input type="radio" name={`radio-${'all'}`} className="form-control radio-primary radio-xs" checked={conversationOperatorView === 'all'} onClick={() => {
                if ('All' === conversationOperatorView) {
                  setConversationOperatorView()
                } else {
                  setConversationOperatorView('all')
                }
              }} />
              <div className={`avatar`}>
                <div className="w-full h-full text-2xl rounded-full">
                  <BsPeopleFill />
                </div>
              </div>
              <p>{t('All conversations')}</p>
            </a>
          </li>}
        {sessionOperator.permissionTier !== 'operator' && <li onClick={() => setConversationOperatorView('bots')}>
          <a className='font-normal'>
            <input type="radio" name={`radio-${sessionOperator.operatorId}`} className="form-control radio-primary radio-xs" checked={conversationOperatorView === 'bots'} onClick={() => {
              if (sessionOperator.operatorId === conversationOperatorView) {
                setConversationOperatorView()
              } else {
                setConversationOperatorView('bots')
              }
            }} />
            <div className={`avatar`}>
              <div className="w-full h-full text-2xl rounded-full">
                <BsRobot />
              </div>
            </div>
            <p>{t('Bots in action')}</p>
          </a>
        </li>}
        {operators?.data?.map((operator) => (
          operator.operatorId !== sessionOperator.operatorId &&
          <li className='flex' >
            <a className='flex flex-row justify-start w-full normal-case place-items-center'>

              <input type="radio" name={`radio-${operator?.operatorId}`} className="form-control radio-primary radio-xs" checked={operator.operatorId === conversationOperatorView} onClick={() => {
                if (operator.operatorId === conversationOperatorView) {
                  setConversationOperatorView()
                } else {
                  setConversationOperatorView(operator.operatorId)
                }
              }} />
              <div className={`avatar ${operator.online ? 'online' : 'offline'}`}>
                <div className="w-6 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={sessionOperator.profilePicture} />
                </div>
              </div>
              <p>
                {operator.name ?? operator.email}
              </p>

            </a>
          </li>
        ))}
      </ul>
    </details >
  )

}