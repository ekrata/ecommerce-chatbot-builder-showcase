import { isMobile } from 'react-device-detect';
import { BsX } from 'react-icons/bs';

import { useChatWidgetStore } from './(actions)/useChatWidgetStore';

export const MinimiseMobileButton: React.FC = () => {
  const { chatWidget: { setWidgetState, setWidgetVisibility } } =
    useChatWidgetStore();

  return (
    isMobile ? <button className='fixed rounded-full bg-backdrop-blur-3xl top-1 right-1 btn-ghost' onClick={() => setWidgetVisibility('minimized')}><BsX className='text-2xl text-white ' /></button> : null
  )

}