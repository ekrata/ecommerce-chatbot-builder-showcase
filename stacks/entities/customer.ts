import { Entity } from 'electrodb';
import { v4 as uuidv4 } from 'uuid';

import { faker } from '@faker-js/faker';

import { rating } from './conversation';

export enum ContactPropertiesEnum {
  name = 'name',
  firstName = 'firstName',
  phone = 'phone',
  email = 'email',
  address = 'address',
  countryCode = 'countryCode',
  orderNumber = 'orderNumber',
  city = 'city',
  averageUnassignedWaitTime = 'averageUnassignedWaitTime',
  averageOpenWaitTime = 'averageOpenWaitTime',
  orgDomain = 'orgDomain',
  orgName = 'orgName',
}

export const contactProperties = [
  ...Object.keys(ContactPropertiesEnum),
] as const;

export const contactSelector = [
  'isEqualTo',
  'isSet',
  'is',
  'contains',
  'startsWith',
  'endsWith',
] as const;

export type ContactProperty = (typeof contactProperties)[number];
export type ContactSelector = (typeof contactSelector)[number];
export const avatarGradients = [
  'bg-gradient-to-r from-green-300 via-blue-500 to-purple-600',
  'bg-[conic-gradient(at_left,_var(--tw-gradient-stops))] from-rose-500 to-indigo-700',
  'bg-[conic-gradient(at_left,_var(--tw-gradient-stops))] from-rose-500 to-indigo-700',
  'bg-gradient-to-tr from-violet-500 to-orange-300',
  'bg-gradient-to-r from-green-300 to-purple-400',
  'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500',
  // 'bg-gradient-to-r from-yellow-100 via-yellow-300 to-yellow-500',
  // 'bg-gradient-to-r from-yellow-600 to-red-600',
  // 'bg-gradient-to-r from-blue-400 to-emerald-400',
  // 'bg-gradient-to-r from-emerald-500 to-lime-600',
  // 'bg-gradient-to-r from-orange-400 to-rose-400',
  // 'bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-sky-500 via-orange-200 to-yellow-600',
  // 'bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-yellow-200 via-emerald-200 to-yellow-200',
  // 'bg-[conic-gradient(at_bottom_left,_var(--tw-gradient-stops))] from-fuchsia-300 via-green-400 to-rose-700',
] as const;

export const Customer = new Entity({
  model: {
    entity: 'customer',
    version: '1',
    service: 'appDb',
  },
  attributes: {
    customerId: {
      type: 'string',
      required: true,
      readOnly: true,
      default: () => uuidv4(),
    },
    orgId: {
      type: 'string',
      required: true,
      readOnly: true,
    },
    avatarBackground: {
      type: 'string',
      default: () => faker.helpers.arrayElement(avatarGradients),
    },
    // set if customer is interacting with a bot
    botId: {
      type: 'string',
      default: '',
    },
    metaSenderId: {
      type: 'string',
    },
    connectionId: {
      type: 'string',
      required: true,
      default: '',
    },
    name: {
      type: 'string',
    },
    firstName: {
      type: 'string',
    },
    phone: {
      type: 'string',
    },
    email: {
      type: 'string',
    },
    countryCode: {
      type: 'string',
    },
    city: {
      type: 'string',
    },
    projectDomain: {
      type: 'string',
    },
    address: {
      type: 'string',
      default: '',
    },
    projectName: {
      type: 'string',
    },
    profilePicture: {
      type: 'string',
    },
    mailingSubscribed: {
      type: 'boolean',
      default: false,
      required: true,
    },
    ip: {
      type: 'string',
    },
    locale: {
      type: 'string',
      required: true,
      default: 'en',
    },
    timezone: {
      type: 'string',
    },
    rating: {
      type: rating,
    },
    userAgent: {
      type: 'string',
    },
    tags: {
      type: 'set',
      items: 'string',
    },
    online: {
      type: 'boolean',
      default: false,
    },
    properties: {
      type: 'map',
      properties: {
        key: {
          type: 'string',
        },
        value: {
          type: 'string',
        },
      },
    },
    notes: {
      type: 'string',
    },
    createdAt: {
      type: 'number',
      default: Date.now(),
    },
    updatedAt: {
      type: 'number',
      watch: '*',
      default: Date.now(),
      set: () => Date.now(),
    },
    lastVisitAt: {
      type: 'number',
      default: Date.now(),
    },
  },
  indexes: {
    primary: {
      pk: {
        field: 'pk',
        composite: ['orgId', 'customerId'],
      },
      sk: {
        field: 'sk',
        composite: [],
      },
    },
    byOrg: {
      index: 'gsi1pk-gsi1sk-index',
      pk: {
        field: 'gsi1pk',
        composite: ['orgId'],
      },
      sk: {
        field: 'gsi1sk',
        composite: ['createdAt'],
      },
    },
  },
});
