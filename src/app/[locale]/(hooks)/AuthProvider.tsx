'use client'

import { EntityItem } from 'electrodb';
import { redirect, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { v4 as uuidv4 } from 'uuid';

import { useQuery } from '@tanstack/react-query';

import { Operator } from '../../../../stacks/entities/operator';
import { useOperatorQuery } from './queries/useOperatorQuery';

export const AuthContext = createContext<[...ReturnType<typeof useLocalStorage < { orgId: string, operatorId: string } | null>>, () => Promise<any>]>([null, () => null, async () => null])
export const useAuthContext = () => useContext(AuthContext);

export const signoutSession = () => {
  window?.localStorage?.removeItem('sessionUser')
  window?.localStorage?.removeItem('session')
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [fetching, setFetching] = useState<boolean>(false);
  const [authToken, setAuthToken] = useLocalStorage<string>('authToken', '');
  const [sessionUserIds, setSessionUserIds] = useLocalStorage<{ orgId: string, operatorId: string } | null>('sessionUserIds', null);
  const operatorQuery = useOperatorQuery(sessionUserIds?.orgId ?? '', sessionUserIds?.operatorId ?? '');
  console.log(operatorQuery?.data)

  const getSession = async () => {
    try {
      setFetching(true)
      // get's the operatorId
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_API_URL}/session?nonce=${uuidv4()}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });
      const resData = await response?.json()
      console.log(response)
      if (response.status === 200) {
        setSessionUserIds({ orgId: resData?.orgId, operatorId: resData?.operatorId })
        // router.push('/')
      }
      setFetching(false)
      if (resData?.message === "Internal Server Error") {
        setSessionUserIds({ orgId: '', operatorId: '' })
        router.push('/')
      }
      return resData
    } catch (error) {
      setSessionUserIds({ orgId: '', operatorId: '' })
      router.push('/')
      setFetching(false)
    }
  };
  // const sessionQuery = useQuery(['getSession'], async () => await getSession())

  useEffect(() => {
    const token = searchParams?.get("token");
    if (token && token !== authToken) {
      setAuthToken(token)
      window?.location?.replace(window?.location?.origin);
    }
  }, [searchParams?.get('token')])


  useEffect(() => {
    (async () => {
      await getSession()
    })()
    console.log(sessionUserIds)
  }, [authToken]);

  useEffect(() => {
    console.log('refetching')
    operatorQuery?.refetch()
  }, [sessionUserIds?.orgId, sessionUserIds?.operatorId])

  return (
    <AuthContext.Provider value={[operatorQuery?.data as unknown as EntityItem<typeof Operator>, setSessionUserIds, operatorQuery.refetch]}>
      {!pathname?.includes('/dash') || !fetching ?
        children :
        < div className="justify-center w-screen h-screen gap-2 bg-white ">
          <div className='flex flex-row justify-center h-full gap-2 place-items-center animate-fade-left '>
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-violet-500 to-orange-300 animate-bounce animate-delay-300 "></div>
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-violet-500 to-orange-300 animate-bounce animate-delay-700"></div>
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-violet-500 to-orange-300 animate-bounce animate-delay-300 "></div>
          </div>
        </div>
      }
    </AuthContext.Provider >
  )
}


