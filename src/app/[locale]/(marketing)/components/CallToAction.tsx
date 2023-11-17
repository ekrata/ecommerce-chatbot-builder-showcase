import { Route } from 'next';
import Image from 'next/image';

import { Button } from '../components/Button';
import { Container } from '../components/Container';
import backgroundImage from '../images/background-call-to-action.jpg';

export function CallToAction() {
  return (
    <section
      id="get-started-today"
      className="relative overflow-hidden md:pb-52 md:py-10 bg-gradient-to-br from-violet-500 to-orange-300"
    >
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 max-w-none "
      />
      <Container className="relative">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl tracking-tight text-white font-display sm:text-4xl">
            Elevate your customer service to new heights with eChat by Ekrata™
          </h2>
          <p className="mt-4 text-lg tracking-tight text-white">
            Experience the seamless blend of human and AI-powered customer support that delivers exceptional results every time.
          </p>
          {/* <Button href={"/register" as Route} color="white" className="mt-10">
            Get 6 months free
          </Button> */}
        </div>
      </Container>
    </section>
  )
}
