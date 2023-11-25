import { useTranslations } from 'next-intl';
import { BiTransferAlt } from 'react-icons/bi';
import { FcCheckmark } from 'react-icons/fc';
import { toast } from 'react-toastify';

import { ConversationItem } from '@/entities/conversation';

import { useUpdateConversationMut } from '../../../(hooks)/mutations/useUpdateConversationMut';
import { useOperatorsQuery } from '../../../(hooks)/queries/useOperatorsQuery';

interface Props {
  conversationItem: ConversationItem
}
export const ActionsTab: React.FC<Props> = ({ conversationItem }) => {
  const t = useTranslations('dash')
  const { orgId, conversationId } = conversationItem
  const operatorsQuery = useOperatorsQuery(conversationItem?.orgId)
  const updateConversationMut = useUpdateConversationMut(orgId, conversationId)

  return (
    <div className='my-6 text-sm'>
      <ul className='space-y-4 animate-fade-left'>
        <li>
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="inline-flex font-normal normal-case text-start btn btn-ghost">
              <p className='flex text-sm gap-x-2 place-items-center'><BiTransferAlt className='inline text-xl text-primary' />{t('Transfer conversation to another operator')}</p>
            </label>
            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              {operatorsQuery?.data?.map((operator) => (
                <li onClick={async () =>
                  await toast.promise(async () => Promise.all([await updateConversationMut.mutateAsync([orgId, conversationId, { operatorId: operator?.operatorId }])]),
                    {
                      pending: t('Transferring conversation'),
                      success: t('Transferred conversation'),
                      error: t('Failed to transfer conversation')
                    }, { position: 'bottom-right' })
                }>

                  <a>{operator?.email}</a></li>
              ))}
            </ul>
          </div>
        </li>
        <li className='flex justify-start w-full place-items-center gap-x-4 text-start'>
          <div className="justify-start w-full text-start">
            <label tabIndex={0} className="justify-start w-full font-normal normal-case btn btn-ghost text-start">
              <p className='flex text-sm place-items-center text-start gap-x-2 '><FcCheckmark className='text-lg text-primary' /><p>{t('Mark as Solved')}</p></p>
            </label>
          </div>
        </li>
      </ul>
    </div >
  )
}