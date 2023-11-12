


import { useTranslations } from 'next-intl';
import { FC, PropsWithChildren, ReactNode, useRef } from 'react';
import { useOnClickOutside } from 'usehooks-ts';
import * as yup from 'yup';

const schema = yup
  .object()
  .shape({
    email: yup.string().required(),
  })
  .required();


type ColorNames = 'success' | 'error' | 'info' | 'warning'
interface Props {
  leftButtonLabel?: string,
  rightButtonLabel?: string,
  actionLabel?: string,
  leftButtonAction?: () => void,
  rightButtonAction?: () => void,
  leftButtonColor?: ColorNames,
  rightButtonColor?: ColorNames,
}

// type EmailType = 'new' | 'existing'
// type EmailProviderType = 'google' | 'microsoft' | 'other mailbox provider'

export const ConfirmationModal: FC<PropsWithChildren<Props>> = ({ leftButtonLabel, rightButtonLabel, leftButtonAction, rightButtonAction, leftButtonColor, rightButtonColor, children, actionLabel }) => {
  const tDash = useTranslations('dash')
  const dialogRef = useRef(null);
  useOnClickOutside(dialogRef, () => {
    (document?.getElementById('confirmation_modal') as HTMLDialogElement)?.close();
  })

  return (
    <>
      <div className="w-full h-full" onClick={() => {
        console.log('open modal');
        (document?.getElementById('confirmation_modal') as HTMLDialogElement)?.showModal()
      }}>
        {children}
      </div >
      <dialog id="confirmation_modal" className="bg-transparent" >
        <form method="dialog" className="flex flex-col gap-y-4 modal-box w-[30rem] place-items-center" ref={dialogRef} >
          {/* <button type="button" className="absolute btn btn-sm btn-circle btn-ghost right-2 top-2" onClick={() => {
            (window as any).confirmation_modal.close()
          }}>✕</button> */}
          <h5 className='text-xl'>{actionLabel}</h5>
          <div className='flex flex-row normal-case gap-x-4'>

            <button type="button" className={`btn btn-sm normal-case rounded-xl  btn-${leftButtonColor ?? 'info'}`} onClick={() => {
              console.log('doing left button')
              leftButtonAction?.();
              (document?.getElementById('confirmation_modal') as HTMLDialogElement)?.close()
            }}>{leftButtonLabel ?? tDash('Yes')}</button>
            <button type="button" className={` btn btn-sm btn-outline normal-case rounded-xl btn-${rightButtonColor ?? 'primary'}`} onClick={() => {
              rightButtonAction?.();
              (document?.getElementById('confirmation_modal') as HTMLDialogElement)?.close();
            }}>{rightButtonLabel ?? tDash('No')}</button>

          </div>
        </form>
        <form method="dialog" className="modal-backdrop">
          <button></button>
        </form>
      </dialog >
    </>
  )
}