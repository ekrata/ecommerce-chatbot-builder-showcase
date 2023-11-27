'use client'


import { useTranslations } from 'next-intl';
import Image from 'next/image';

// import hero from '../../../../../public/hero-image/all.png';
import hero from '../../../../../public/graphics/chatbot.gif';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { SignupModal } from './SignupModal';

// const gallery = Object.values(import.meta.glob("../../../../../public/graphics/*.{png,jpg,jpeg,PNG,JPEG}", { eager: true, as: 'url' }))
export function Hero() {
  const t = useTranslations('marketing')
  return (
    <Container className="h-screen min-h-screen pt-4 pb-40 text-center bg-white lg:pt-20 md:pt-10 ">
      <div className='flex flex-col w-full text-center lg:mt-12 lg:flex-row animate-fade place-items-center'>
        <div className='justify-center w-full px-0 mt-10 rounded-md animate-fade-left duration-[2000ms] md:p-0 place-items-center'>
          {/* <Image src={download1} className="self-center skew-y-6 rounded-md shadow-lg bg-white/50 shadow-blue-100  md:h-[500px] md:w-[500px] " alt={''}></Image> */}
          {/* <div className="p-4 px-0 pb-0 border rounded-md mockup-window bg-base-300 animate-flip-up"> */}
          <Image src={hero} className="  object-contain  saturate-200  self-center         rounded-t-none rounded-md border-0            lg:w-[600px]  " alt={''}></Image>
          {/* </div> */}

          {/* <Image src={hero} className="self-center skew-y-6 rounded-md shadow-lg bg-white/50 shadow-blue-100  md:h-[500px] md:w-[500px] " alt={''}></Image> */}
          {/* <Image src={hero} className="self-center skew-y-6 rounded-md shadow-lg bg-white/50 shadow-blue-100  md:h-[500px] md:w-[500px] " alt={''}></Image> */}
        </div>
        <div className="max-w-4xl mx-auto text-lg font-medium tracking-tight md:pr-10 lg:pr-10 md:text-xl text-start font-display text-slate-900 sm:text-7xl">
          {/* <h2 className="inline-flex w-full px-2 py-1 mb-4 text-5xl bg-white rounded-md shadow-md place-items-center text-slate-900 bg-gradient-to-tr from-violet-500 to-orange-300">
            <span className='ml-2 text-sm font-normal tracking-normal md:text-2xl text-slate-100 animate-fade-left bg-clip-text'>
              eChat by Ekrata™️ - AI Powered Customer Service
            </span>

          </h2> */}
          <br />
          <br />
          <h2 className="text-3xl md:text-6xl animate-fade-left">
            {/* {t('Ecommerce')} */
            }
            <span className="relative text-transparent text-blue-600 bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 ">
              Human and AI-Based Customer Service
            </span>
            {' like never before.'}

            <div className='divider divider-vertical'></div>
            <span className="relative text-center ">
              {/* <svg
                aria-hidden="true"
                viewBox="0 0 300 42"
                className="absolute overflow-visible mt-8 md:mt-16 left-0 top-2/3 h-[0.58em] w-full fill-blue-300/50 "
                preserveAspectRatio="none"
              >
                <path stroke="none" fill="currentColor" d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z" />
              </svg> */}

              <span className="relative inline-flex justify-center text-xl text-center place-items-center gap-x-4 md:justify-start md:text-start md:text-5xl ">Excel with eChat by Ekrata™
              </span>

              <br />
              <div className='flex flex-row justify-start mt-4 text-lg md:mt-8 gap-x-4 '>
                <Button href={'#pricing'} className='normal-case border-0 btn-sm flex-nowrap whitespace-nowrap'>Explore pricing</Button>
                <SignupModal><Button className='normal-case border-0 place-items-center bg-gradient-to-tr btn-sm from-violet-500 to-orange-300 hover:animate-pulse'>Start free trial</Button></SignupModal>
              </div>
            </span>{' '}

          </h2>
        </div>

      </div>
      {/* <p className="max-w-2xl mx-auto mt-12 text-lg tracking-tight text-slate-700">
        Most bookkeeping software is accurate, but hard to use. We make the
        opposite trade-off, and hope you don’t get audited.
      </p> */}
      <div className="flex justify-center mt-10 gap-x-6">
        {/* <Button href={{ pathname: "/register" }}>Get 6 months free</Button>
        <Button
          href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          variant="outline"
        >
          <svg
            aria-hidden="true"
            className="flex-none w-3 h-3 fill-blue-600 group-active:fill-current"
          >
            <path d="m9.997 6.91-7.583 3.447A1 1 0 0 1 1 9.447V2.553a1 1 0 0 1 1.414-.91L9.997 5.09c.782.355.782 1.465 0 1.82Z" />
          </svg>
          <span className="ml-3">Watch video</span>
        </Button> */}
      </div>
      {/* <div className="mt-36 lg:mt-44">
        <p className="text-base font-display text-slate-900">
          Trusted by these six companies so far
        </p>
        <ul
          role="list"
          className="flex items-center justify-center mt-8 gap-x-8 sm:flex-col sm:gap-x-0 sm:gap-y-10 xl:flex-row xl:gap-x-12 xl:gap-y-0"
        >
          {[
            [
              { name: 'Transistor', logo: logoTransistor },
              { name: 'Tuple', logo: logoTuple },
              { name: 'StaticKit', logo: logoStaticKit },
            ],
            [
              { name: 'Mirage', logo: logoMirage },
              { name: 'Laravel', logo: logoLaravel },
              { name: 'Statamic', logo: logoStatamic },
            ],
          ].map((group, groupIndex) => (
            <li key={groupIndex}>
              <ul
                role="list"
                className="flex flex-col items-center gap-y-8 sm:flex-row sm:gap-x-12 sm:gap-y-0"
              >
                {group.map((company) => (
                  <li key={company.name} className="flex">
                    <Image src={company.logo} alt={company.name} unoptimized />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div> */}
    </Container >
  )
}
