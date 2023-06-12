import { BiHelpCircle, BiHomeSmile, BiMessageDetail } from 'react-icons/bi';
import { useCustomerChatStore } from './(actions)/useCustomerChatStore';
import { FC } from 'react';

export const NavBar: FC = () => {
  const { widgetState } = useCustomerChatStore();
  return (
    <div className="btm-nav">
      <button className={`${widgetState === 'home' && 'active'}`}>
        <BiHomeSmile />
      </button>
      <button className={`${widgetState === 'messages' && 'active'}`}>
        <BiMessageDetail />
      </button>
      <button className={`${widgetState === 'help' && 'active'}`}>
        <BiHelpCircle />
      </button>
    </div>
  );
};
