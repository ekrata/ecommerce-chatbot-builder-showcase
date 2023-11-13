import { EntityItem } from 'electrodb';

import {
  contactProperties,
  ContactProperty,
  Customer,
} from '@/entities/customer';
import { Org } from '@/entities/org';

import { getAppDb } from '../db';
import { BotStateContext } from '../nodes/botStateContext';

const extractContent = (text: string) => {
  const pattern = /{([^}]+)}/g;
  const matches = text.match(pattern);
  return matches ? matches.map((match) => match.slice(1, -1)) : [];
};

export const fillTemplateStringFields = async (
  text: string,
  orgId: string,
  customerId: string,
  appDb: ReturnType<typeof getAppDb>,
) => {
  const matches = extractContent(text) as ContactProperty[];
  let filledText = text;

  // is the value that will be fill founded on an org or a customer or both
  let orgFields: ContactProperty[] = [];
  let customerFields: ContactProperty[] = [];

  // get a list of all the fields that appear in the string
  matches.forEach((match) => {
    switch (match) {
      case 'averageOpenWaitTime':
        orgFields = [...orgFields, 'averageOpenWaitTime'];
      case 'averageUnassignedWaitTime':
        orgFields = [...orgFields, 'averageUnassignedWaitTime'];
      case 'orgDomain':
        orgFields = [...orgFields, 'orgDomain'];
      case 'orgName':
        orgFields = [...orgFields, 'orgName'];
      case 'city':
        customerFields = [...customerFields, 'city'];
      case 'countryCode':
        customerFields = [...customerFields, 'countryCode'];
      case 'email':
        customerFields = [...customerFields, 'email'];
      case 'firstName':
        customerFields = [...customerFields, 'firstName'];
      case 'name':
        customerFields = [...customerFields, 'name'];
      case 'phone':
        customerFields = [...customerFields, 'phone'];
    }
  });

  let org: EntityItem<typeof Org> | null;
  let customer: EntityItem<typeof Customer> | null;
  // get org
  if (orgFields?.length && orgId) {
    org = (await appDb.entities.orgs.get({ orgId }).go())?.data;
  }
  // get customer
  if (customerFields?.length && orgId && customerId) {
    customer = (await appDb.entities.customers.get({ orgId, customerId }).go())
      ?.data;
  }

  // fill org fields
  orgFields.forEach((orgField) => {
    let mappedField = '';
    if (orgField === 'orgDomain') {
      mappedField = 'domain';
    }
    if (orgField === 'orgName') {
      mappedField = 'name';
    }
    const fieldValue = Object(org)?.[`${mappedField}`];
    if (fieldValue != null) {
      filledText = filledText.replaceAll(`{${orgField}}`, fieldValue);
    }
  });

  // fill customer fields
  customerFields.forEach((customerField) => {
    let mappedField = customerField;
    const fieldValue = Object(customer)?.[`${mappedField}`];
    if (fieldValue != null) {
      filledText = filledText.replaceAll(`{${customerField}}`, fieldValue);
    }
  });
  return filledText;
};
