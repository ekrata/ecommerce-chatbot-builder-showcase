import { BiHelpCircle, BiHomeSmile, BiMessageDetail } from 'react-icons/bi';
import { FC } from 'react';
import { useChatWidgetStore } from './(actions)/useChatWidgetStore';

export const NavBar: FC = () => {
  const { chatWidget: {widgetState} } = useChatWidgetStore();
  return (
    <div className="btm-nav">
      <button className={`${widgetState === 'home' && 'active'}`}>
        <BiHomeSmile />
        <h4>Home</h4>
      </button>
      <button className={`${widgetState === 'messages' && 'active'}`}>
        <BiMessageDetail />
        <h4>Messages</h4>
      </button>
      <button className={`${widgetState === 'help' && 'active'}`}>
        <BiHelpCircle />
        <h4>Help</h4>
      </button>
    </div>
  );
};
