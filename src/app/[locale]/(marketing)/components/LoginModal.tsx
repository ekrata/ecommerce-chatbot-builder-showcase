import { useTranslations } from 'next-intl';
import { FC, PropsWithChildren, ReactNode, useRef } from 'react';
import { FaGoogle } from 'react-icons/fa';
import { useOnClickOutside } from 'usehooks-ts';
import * as yup from 'yup';

import { Button } from './Button';
import { SignupModal } from './SignupModal';

// import { SignupModal } from './SignupModal';

// import { SignupModal } from './SignupModal';

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

export const LoginModal: FC<PropsWithChildren<Props>> = ({ leftButtonLabel, rightButtonLabel, leftButtonAction, rightButtonAction, leftButtonColor, rightButtonColor, children, actionLabel }) => {
  const t = useTranslations('marketing')
  const tDash = useTranslations('dash')
  const dialogRef = useRef(null);
  useOnClickOutside(dialogRef, () => {
    (document?.getElementById('login_modal') as HTMLDialogElement)?.close();
  })

  return (
    <>
      <div className="" onClick={() => {
        console.log('open modal');
        (document?.getElementById('login_modal') as HTMLDialogElement)?.showModal()
      }}>
        {children}
      </div >
      <dialog id="login_modal" className="bg-transparent shadow-none select-none" >
        <form method="dialog" className="flex  flex-col rounded-md gap-y-4  modal-box w-[30rem] place-items-center bg-[conic-gradient(at_left,_var(--tw-gradient-stops))] from-yellow-500/10 via-purple-500/10 to-blue-500/10 backdrop-blur-2xl" ref={dialogRef} >
          <h5 className='text-2xl font-semibold'>{t('Sign in')}</h5>
          <Button className='gap-x-2' href={`${process.env.NEXT_PUBLIC_APP_API_URL}/auth/google/authorize`} rel="noreferrer">
            <FaGoogle />
            {t('Sign in with google')}
          </Button>
        </form>
        <form method="dialog" className="modal-backdrop">
          <button></button>
        </form>
      </dialog >
    </>
  )
}