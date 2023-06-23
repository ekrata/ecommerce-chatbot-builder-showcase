import { BiHelpCircle, BiHomeSmile, BiMessageDetail } from 'react-icons/bi';
import { FC } from 'react';
import { useChatWidgetStore } from './(actions)/useChatWidgetStore';

export const NavBar: FC = () => {
  const { chatWidget: {widgetState, setWidgetState} } = useChatWidgetStore();
  return (
    <div className="btm-nav rounded-b-lg animate-fade-left">
        <button className={`rounded-bl-lg ${widgetState === 'home' && 'active'}`} onClick={() => setWidgetState('home')}>
          <BiHomeSmile className='text-2xl'/>
          <h4>Home</h4>
        </button>
        <button className={`${widgetState === 'messages' && 'active'}`} onClick={() => setWidgetState('messages') }>
          <BiMessageDetail className='text-2xl' />
          <h4>Messages</h4>
        </button>
        <button className={`rounded-br-lg ${widgetState === 'help' && 'active'}`} onClick={() => setWidgetState('help') }>
          <BiHelpCircle className='text-2xl '/>
          <h4>Help</h4>
        </button>
      </div>
  );
};
