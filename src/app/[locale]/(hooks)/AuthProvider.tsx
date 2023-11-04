'use client'

import { EntityItem } from 'electrodb';
import { uniqueId } from 'lodash';
import { redirect, useRouter, useSearchParams } from 'next/navigation';
import {
  createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState
} from 'react';
import { toast } from 'react-toastify';
import { useLocalStorage } from 'usehooks-ts';
import { v4 as uuidv4 } from 'uuid';

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
  const [authToken, setAuthToken] = useLocalStorage<string>('authToken', '');
  const [sessionUser, setSessionUser] = useLocalStorage<EntityItem<typeof Operator> | null>('sessionUser', null);

  const getUserInfo = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_API_URL}/session?nonce=${uuidv4()}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });
      console.log(response)
      if (response.status !== 200) {
        router.push('/')
      }
      return await response.json();
    } catch (error) {

      router.push('/')
      redirect('/')
    }
  };

  useEffect(() => {
    const token = searchParams?.get("token");
    if (token && token !== authToken) {
      setAuthToken(token)
      window?.location?.replace(window?.location?.origin);
    }
  }, [searchParams?.get('token')])


  useEffect(() => {
    (async () => {
      const data = await getUserInfo()
      setSessionUser(data)
    })()
  }, [authToken]);

  return (
    <AuthContext.Provider value={[sessionUser, setSessionUser]}>
      {children}
    </AuthContext.Provider>
  )
}


