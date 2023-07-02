import { useSearchParams } from 'next/navigation';
import {isDesktop} from 'react-device-detect';

export default function Page() {
  const searchParams = useSearchParams();

  // E.g. `/dashboard?page=2&order=asc`
  const conversationId = searchParams.get('conversationId');

  const renderMobile = () => {
    if(!conversationId) {
      return <ConversationView></ConversationView>
    }
  }

  return (
    
  );