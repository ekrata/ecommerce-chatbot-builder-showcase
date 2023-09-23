'use client'

import { EntityItem } from 'electrodb';
import { uniqueId } from 'lodash';
import { useSearchParams } from 'next/navigation';
import {
  createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState
} from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { v4 as uuidv4 } from 'uuid';

import { Operator } from '@/entities/operator';

export const AuthContext = createContext<ReturnType<typeof useLocalStorage < EntityItem<typeof Operator> | null>>>([null, () => null])
export const useAuthContext = () => useContext(AuthContext);

export const signoutSession = () => {
  window.localStorage.removeItem('sessionUser')
  window.localStorage.removeItem('session')
}

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const searchParams = useSearchParams()
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
      return await response.json();
    } catch (error) {
      throw new Error('failed to getUserInfo')
    }
  };

  useEffect(() => {
    const token = searchParams?.get("token");
    if (token && token !== authToken) {
      setAuthToken(token)
      window.location.replace(window.location.origin);
    }
  }, [searchParams?.get('token')])


  useEffect(() => {
    (async () => {
      const data = await getUserInfo()
      setSessionUser(data)
    })()
  }, [authToken]);


  return <AuthContext.Provider value={[sessionUser ?? null, setSessionUser]}>
    {children}
  </AuthContext.Provider>
}


