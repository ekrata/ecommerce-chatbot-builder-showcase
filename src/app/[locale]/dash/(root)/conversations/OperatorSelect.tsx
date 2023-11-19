'use client';

import { getCookie } from 'cookies-next';
import { t } from 'msw/lib/glossary-de6278a9';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { BsPeopleFill, BsPerson, BsRobot } from 'react-icons/bs';
import { FaChevronDown } from 'react-icons/fa';

import { PermissionTier } from '@/entities/operator';

import { useDashStore } from '../(actions)/useDashStore';
import { useAuthContext } from '../../../(hooks)/AuthProvider';
import { useOperatorsQuery } from '../../../(hooks)/queries/useOperatorsQuery';

interface Props {
  dropdownPosition?: 'end'
}

export const OperatorSelect: React.FC<Props> = ({ dropdownPosition }) => {
  const t = useTranslations('dash');
  const [sessionOperator] = useAuthContext();
  const { conversationListFilter, setConversationListFilter } = useDashStore()
  const { operatorId } = conversationListFilter
  const operators = useOperatorsQuery(sessionOperator?.orgId ?? '')

  // if undefined, set to sessionOperator
  useEffect(() => {
    if (sessionOperator?.operatorId) {
      setConversationListFilter({ ...conversationListFilter, operatorId: sessionOperator?.operatorId })
    }
  }, [])

  const displaySelectedAvatar = () => {
    if (operatorId === 'all') {
      return <div className={`avatar place-items-center`}>
        <div className="w-8 h-8 text-2xl rounded-full ring-white place-items-center ">
          <BsPeopleFill className='w-full h-full text-2xl text-gray-200' />
        </div>
      </div>
    }
    else if (operatorId === 'bots') {
      return <div className={`avatar place-items-center`}>
        <div className="w-8 h-8 text-2xl rounded-full place-items-center ring ring-white ring-offset-base-100 ring-offset-1">
          <BsRobot className='w-full h-full text-2xl' />
        </div>
      </div>
    }
    else if (operatorId === sessionOperator?.operatorId) {
      return sessionOperator?.profilePicture ? <div className={`avatar ${sessionOperator.online ? 'online' : 'offline'} place-items-center`}>
        <div className="w-8 h-8 text-2xl rounded-full place-items-center ring-white">
          <img className='w-8 h-8' width={8} height={8} src={sessionOperator?.profilePicture}></img>
        </div>
      </div> : <BsPerson />
    }
    else {
      // find selectedOperatorView id in operators query
      // const operator = operators?.data?.find((operator) => operator?.operatorId === operatorId);
      return sessionOperator?.profilePicture ?
        <div className={`avatar ${sessionOperator?.online ? 'online' : 'offline'} place-items-center`}>
          <div className="w-8 h-8 text-2xl rounded-full place-items-center ring ring-white">
            <img className='w-8 h-8' width={8} height={8} src={sessionOperator?.profilePicture}></img>
          </div>
        </div>
        : <BsPerson />
    }
  }


  return (
    <details className={`w-full h-full dropdown text-sm ${dropdownPosition ? `dropdown-${dropdownPosition}` : ''}`}>
      <summary className="flex normal-case btn btn-ghost place-items-center gap-x-2">
        {displaySelectedAvatar()}
        {/* <FaChevronDown className='text-gray-400'></FaChevronDown> */}
      </summary>
      <ul className="p-2 shadow menu dropdown-content max-h-screen-2/3 overflow-y-scroll z-[1] bg-base-100 rounded-box w-80">
        <li key={'operator'} onClick={() => {
          setConversationListFilter({ ...conversationListFilter, operatorId })
        }}>
          <a>
            <input type="radio" name={`radio-${sessionOperator?.operatorId}`} className="form-control radio-primary radio-xs" checked={operatorId === sessionOperator?.operatorId} defaultChecked={operatorId === sessionOperator?.operatorId} />
            <div className={`avatar ${sessionOperator?.online ? 'online' : 'offline'}`}>
              <div className="w-8 rounded-full ">
                <img src={sessionOperator?.profilePicture} />
              </div>
            </div>
            <p>{sessionOperator?.name ?? sessionOperator?.email} ({t('You')})</p>
          </a>
        </li>
        {sessionOperator?.permissionTier !== 'operator' &&
          <li key={'all'} onClick={() => {
            setConversationListFilter({ ...conversationListFilter, operatorId: 'all' })
          }}>
            <a className='text-sm font-normal place-items-center'>
              <input type="radio" name={`radio-${'all'}`} className="form-control radio-primary radio-xs" defaultChecked={operatorId === 'all'} />
              <div className={`avatar`}>
                <div className="w-8 text-2xl rounded-full">
                  <BsPeopleFill />
                </div>
              </div>
              <p>{t('All conversations')}</p>
            </a>
          </li>}
        {sessionOperator?.permissionTier !== 'operator' &&
          <li key={'bots'} onClick={() => setConversationListFilter({ ...conversationListFilter, operatorId: 'all' })}>
            <a className='font-normal'>
              <input type="radio" name={`radio-${sessionOperator?.operatorId}`} className="form-control radio-primary radio-xs" defaultChecked={operatorId === 'bots'} onClick={() => {
                setConversationListFilter({ ...conversationListFilter, operatorId: 'bots' })
              }} />
              <div className={`avatar`}>
                <div className="w-8 text-2xl rounded-full">
                  <BsRobot />
                </div>
              </div>
              <p>{t('Bots in action')}</p>
            </a>
          </li>}
        {sessionOperator?.permissionTier !== 'operator' &&
          operators?.data?.map((operator) => (
            operator.operatorId !== sessionOperator?.operatorId &&
            <li key={'all'} className='flex' onClick={() => {
              setConversationListFilter({ ...conversationListFilter, operatorId: operator?.operatorId })
            }}>
              <a className='flex flex-row justify-start w-full normal-case place-items-center'>
                <input type="radio" name={`radio-${operator?.operatorId}`} className="form-control radio-primary radio-xs" defaultChecked={operatorId === 'all'} />
                <div className={`avatar ${operator?.online ? 'online' : 'offline'}`}>
                  <div className="w-8 rounded-full ">
                    {operator?.profilePicture ? <img src={operator?.profilePicture} /> : <BsPerson className="text-xl" />}
                  </div>
                </div>
                <p>
                  {operator?.email}
                </p>
              </a>
            </li>
          ))}
      </ul>
    </details >
  )

}