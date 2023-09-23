import { Metadata, Route } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '../../../components/Button';
import { Logo } from '../../../components/Logo';
import { SlimLayout } from '../../../components/SlimLayout';

export const metadata: Metadata = {
  title: 'Sign In',
}

export default function Login() {


  return (
    <SlimLayout>
      <div className="flex">
        <Link href={"/" as Route} aria-label="Home">
          <Logo className="w-auto h-10" />
        </Link>
      </div>
      <h2 className="mt-20 text-lg font-semibold text-gray-900">
        Sign in to your account
      </h2>
      <p className="mt-2 text-sm text-gray-700">
        Don’t have an account?{' '}
        <Link
          href="/register"
          className="font-medium text-blue-600 hover:underline"
        >
          Sign up
        </Link>
        {' '}
        for a free trial.
      </p>
      {/* <script src="https://accounts.google.com/gsi/client" async defer>
      </script> */}

      {/* <script type="text/javascript">
        {
          async function callback() {
            return await fetch()
          }
        }
      </script> */}

      <a
        href={`${process.env.NEXT_PUBLIC_APP_API_URL}/auth/google/authorize`}
        rel="noreferrer"
      >
        <Button>
          Sign in with google
          {/* <div id="g_id_onload"
          data-client_id="11916374620-iveeirp449he0iocir9j15v4be5c1rjt.apps.googleusercontent.com"
          data-context="signup"
          data-ux_mode="popup"
          data-auto_select="true"
          data-itp_support="true">
        </div>
        <div className="g_id_signin"
          data-type="standard"
          data-shape="pill"
          data-theme="outline"
          data-text="continue_with"
          data-size="large"
          data-logo_alignment="left">
        </div> */}
        </Button>
      </a>
    </SlimLayout>
  )
}
