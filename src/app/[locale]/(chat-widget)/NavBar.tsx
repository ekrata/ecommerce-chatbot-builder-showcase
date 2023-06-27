import { BiHelpCircle, BiHomeSmile, BiMessageDetail } from 'react-icons/bi';
import { FC } from 'react';
import { useChatWidgetStore } from './(actions)/useChatWidgetStore';

export const NavBar: FC = () => {
  const { chatWidget: {widgetState, setWidgetState} } = useChatWidgetStore();
  return (
    <div className="btm-nav rounded-b-3xl sticky shadow-[0px_-20px_40px_20px_#FFF]">
        <button className={`rounded-bl-3xl ${widgetState === 'home' && 'active'}`} onClick={() => setWidgetState('home')}>
          <BiHomeSmile className='text-2xl'/>
          <h4>Home</h4>
        </button>
        <button className={`${widgetState === 'conversations' && 'active'}`} onClick={() => setWidgetState('conversations') }>
          <BiMessageDetail className='text-2xl' />
          <h4>Messages</h4>
        </button>
        <button className={`rounded-br-3xl ${widgetState === 'help' && 'active'}`} onClick={() => setWidgetState('help') }>
          <BiHelpCircle className='text-2xl '/>
          <h4>Help</h4>
        </button>
      </div>
  );
};
