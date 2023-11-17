
import { CallToAction } from '../components/CallToAction';
import { Faqs } from '../components/Faqs';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Pricing } from '../components/Pricing';
import { PrimaryFeatures } from '../components/PrimaryFeatures';
import { SecondaryFeatures } from '../components/SecondaryFeatures';
import { Testimonials } from '../components/Testimonials';
import Footer from '../Footer';

export default function Home() {
  return (
    <>
      <Hero />
      <PrimaryFeatures />
      <SecondaryFeatures />
      <CallToAction />
      {/* <Testimonials /> */}
      <Pricing />
      {/* <Faqs /> */}
    </>
  )
}
