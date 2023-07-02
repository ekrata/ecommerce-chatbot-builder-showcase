import { BiHelpCircle, BiHome, BiHomeSmile, BiMessageDetail } from 'react-icons/bi';
import { FC } from 'react';
import { useChatWidgetStore } from './(actions)/useDashStore';
import { BsChatFill, BsPeopleFill, BsTicketFill } from 'react-icons/bs';
import { IoMdSettings } from 'react-icons/io';

export const NavBar: FC = () => {
  const { chatWidget: {widgetState, setWidgetState} } = useChatWidgetStore();
  return (
    <div className="btm-nav rounded-b-3xl sticky shadow-[0px_-20px_40px_20px_#FFF]" data-testid='navbar'>
        <button data-testid='navbar-home' className={`rounded-bl-3xl ${widgetState === 'home' && 'active'}`} onClick={() => setWidgetState('home')}>
          <BsChatFill className='text-2xl'/>
        </button>
        <button data-testid='navbar-conversations' className={`${widgetState === 'conversations' && 'active'}`} onClick={() => setWidgetState('conversations') }>
          <BsTicketFill className='text-2xl' />
        </button>
        <button data-testid='navbar-home'className={`rounded-br-3xl ${widgetState === 'help' && 'active'}`} onClick={() => setWidgetState('help') }>
          <BiHome className='text-2xl '/>
        </button>
        <button data-testid='navbar-fill'className={`rounded-br-3xl ${widgetState === 'help' && 'active'}`} onClick={() => setWidgetState('help') }>
          <BsPeopleFill className='text-2xl '/>
        </button>
        <button data-testid='navbar-settings'className={`rounded-br-3xl ${widgetState === 'help' && 'active'}`} onClick={() => setWidgetState('help') }>
          <IoMdSettings className='text-2xl '/>
        </button>
      </div>
  );
};
