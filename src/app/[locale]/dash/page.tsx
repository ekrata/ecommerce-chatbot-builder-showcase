import { PropsWithChildren } from 'react';
import { AppSocketProvider } from '@/components/AppSocketProvider';
import DashNavbar from './DashNavbar';
import DashHeader from './DashHeader';
import { DashProvider } from './DashProvider';
import { cookies } from 'next/headers';
import { EntityItem } from 'electrodb';
import { Operator } from '@/entities/operator';
import { setCookie } from 'cookies-next';

export default function Page() {
  return (
    <>
      <ConversationsView></ConversationsView>
      <ConversationView></ConversationView>
      <CustomerView></CustomerView>
    </>
  );
}
