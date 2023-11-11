'use client'

import { EntityItem } from 'electrodb';
import { redirect, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { v4 as uuidv4 } from 'uuid';

import { useQuery } from '@tanstack/react-query';

import { Operator } from '../../../../stacks/entities/operator';

export const AuthContext = createContext<ReturnType<typeof useLocalStorage < EntityItem<typeof Operator> | null>>>([null, () => null])
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
  const [sessionUser, setSessionUser] = useLocalStorage<EntityItem<typeof Operator> | null>('sessionUser', null);

  const getSession = async () => {
    try {
      setFetching(true)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_API_URL}/session?nonce=${uuidv4()}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });
      console.log(response)
      if (response.status !== 200) {
        setSessionUser(null)
        router.push('/')

      }
      setFetching(false)
      return (await response?.json());
    } catch (error) {
      setSessionUser(null)
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
      const data = await getSession()
      setSessionUser(data)
    })()
  }, [authToken]);

  return (
    <AuthContext.Provider value={[sessionUser, setSessionUser]}>
      {!pathname?.includes('/dash') || !fetching ?
        children :
        < div className="justify-center w-screen h-screen gap-2 bg-white ">
          <div className='flex flex-row justify-center h-full gap-2 place-items-center animate-fade-left '>
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 animate-bounce animate-delay-300 "></div>
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 animate-bounce animate-delay-700"></div>
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 animate-bounce animate-delay-300 "></div>
          </div>
        </div>
      }
    </AuthContext.Provider >
  )
}


