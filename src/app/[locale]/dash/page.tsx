'use-client';

import { PropsWithChildren } from 'react';
import { useTranslations } from 'next-intl';
import { BsChatLeft } from 'react-icons/bs';
import { IoMdChatbubbles } from 'react-icons/io';
import { RiChatCheckLine } from 'react-icons/ri';

export default function Page({ children }: PropsWithChildren) {
  return <div>{children}</div>;
}
