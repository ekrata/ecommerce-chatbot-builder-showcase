import { useTranslations } from 'next-intl';
import { BsChatLeftText, BsRobot } from 'react-icons/bs';
import { GiTriforce } from 'react-icons/gi';
import { GrMultiple, GrDocumentText, GrLineChart } from 'react-icons/gr';
import { HiOutlineShoppingBag, HiOutlineXMark } from 'react-icons/hi2';
import { RiMailSendFill, RiShoppingCartFill } from 'react-icons/ri';
import { SiSimpleanalytics } from 'react-icons/si';
import { TbDeviceAnalytics, TbCurrencyDollarOff } from 'react-icons/tb';

export default function MenuData() {
  const t = useTranslations('navbar');

  return {
    products: {
      title: t('products.title'),
      customerService: {
        title: t('products.customer-service.title'),
        items: [
          {
            title: t('products.customer-service.live-chat.title'),
            description: t('products.customer-service.live-chat.description'),
            route: '/product/customer-service/live-chat',
            icon: <BsChatLeftText />,
          },
          {
            title: t('products.customer-service.chat-bot.title'),
            description: t('products.customer-service.chat-bot.description'),
            route: '/product/customer-service/chat-bot',
            icon: <BsRobot />,
          },

          {
            title: t('products.customer-service.multichannel.title'),
            description: t(
              'products.customer-service.multichannel.description'
            ),
            route: '/product/customer-service/multichannel',
            icon: <GiTriforce />,
          },
        ],
      },
      salesAndAnalytics: {
        title: t('products.sales-analytics.title'),
        items: [
          {
            title: t('products.sales-analytics.live-analytics.title'),
            description: t(
              'products.sales-analytics.live-analytics.description'
            ),
            route: '/product/sales-analytics/live-analytics',
            icon: <TbDeviceAnalytics />,
          },
          {
            title: t('products.sales-analytics.intelligent-analytics.title'),
            description: t(
              'products.sales-analytics.intelligent-analytics.description'
            ),
            route: '/product/sales-analytics/intelligent-analytics',
            icon: <SiSimpleanalytics />,
          },
        ],
      },
      marketingAndAnalytics: {
        title: t('products.marketing-advertising.title'),
        items: [
          {
            title: t('products.marketing-advertising.email-marketing.title'),
            description: t(
              'products.marketing-advertising.email-marketing.description'
            ),
            route: '/product/marketing-advertising/email-marketing',
            icon: <RiMailSendFill />,
          },
          {
            title: t(
              'products.marketing-advertising.multichannel-marketing.title'
            ),
            description: t(
              'products.marketing-advertising.multichannel-marketing.description'
            ),
            route: '/product/marketing-advertising/multichannel-marketing',
            icon: <GrMultiple />,
          },
        ],
      },
    },
    pricing: {
      title: t('pricing.title'),
      plans: {
        title: t('pricing.title'),
        items: [
          {
            title: t('pricing.free.title'),
            description: t('pricing.free.description'),
            route: '/pricing',
            icon: <TbCurrencyDollarOff />,
          },
          {
            title: t('pricing.starter.title'),
            description: t('pricing.starter.description'),
            route: '/pricing',
            icon: <HiOutlineShoppingBag />,
          },
          {
            title: t('pricing.scale.title'),
            description: t('pricing.scale.description'),
            route: '/pricing',
            icon: <RiShoppingCartFill />,
          },
        ],
      },
    },
    resources: {
      title: t('resources.title'),
      learn: {
        title: t('resources.learn.title'),
        items: [
          {
            title: t('resources.learn.blog.title'),
            description: t('resources.learn.blog.description'),
            route: '/blog',
            icon: <GrDocumentText />,
          },
          {
            title: t('resources.learn.customer.title'),
            description: t('resources.learn.customer.description'),
            route: '/learn/customer-success',
            icon: <GrLineChart />,
          },
        ],
      },
      compare: {
        title: t('resources.compare.title'),
        items: [
          {
            title: t('resources.compare.tidio.title'),
            description: t('resources.compare.tidio.description'),
            route: '/compare/tidio',
            icon: <HiOutlineXMark />,
          },
          {
            title: t('resources.compare.livechat.title'),
            description: t('resources.compare.livechat.description'),
            route: '/compare/livechat',
            icon: <HiOutlineXMark />,
          },
          {
            title: t('resources.compare.intercom.title'),
            description: t('resources.compare.intercom.description'),
            route: '/compare/intercom',
            icon: <HiOutlineXMark />,
          },
        ],
      },
      helpCenter: {
        title: t('resources.help-center.title'),
        items: [
          {
            title: t('resources.help-center.installation.title'),
            description: t('resources.help-center.installation.description'),
            route: '/help-center/installation',
            icon: <HiOutlineXMark />,
          },
          {
            title: t('resources.help-center.installation.title'),
            description: t('resources.help-center.installation.description'),
            route: '/help-center/installation',
            icon: <HiOutlineXMark />,
          },
        ],
      },
    },
  };
}
