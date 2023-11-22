'use client'

import { EntityItem } from 'electrodb';
import { redirect, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { v4 as uuidv4 } from 'uuid';

import { useQuery } from '@tanstack/react-query';

import { Operator } from '../../../../stacks/entities/operator';
import { getOperator, useOperatorQuery } from './queries/useOperatorQuery';

export const AuthContext = createContext<[...ReturnType<typeof useLocalStorage < { orgId: string, operatorId: string } | null>>]>([null, () => null])
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
  const [operator, setOperator] = useState<EntityItem<typeof Operator> | null>(null);
  const [authToken, setAuthToken] = useLocalStorage<string>('authToken', '');
  const [sessionUserIds, setSessionUserIds] = useLocalStorage<{ orgId: string, operatorId: string } | null>('sessionUserIds', null);
  console.log(sessionUserIds)

  useEffect(() => {
    (async () => {
      if (sessionUserIds?.operatorId && sessionUserIds.orgId) {
        const res = await getOperator(sessionUserIds?.orgId ?? '', sessionUserIds?.operatorId ?? '')
        setOperator(res);
      }
    })()
  }, [sessionUserIds?.orgId, sessionUserIds?.operatorId])


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
      console.log(resData)
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
      console.log('refetching')
      // const res = await operatorQuery?.refetch()
    })()
    console.log(sessionUserIds)
  }, [authToken]);

  // useEffect(() => {
  //   if (fetching === false) {

  //   }
  // }, [sessionUserIds?.orgId, sessionUserIds?.operatorId, fetching])

  // console.log(operatorQuery.data)
  return (
    <AuthContext.Provider value={[operator as unknown as EntityItem<typeof Operator> ?? sessionUserIds, setSessionUserIds,]}>
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


