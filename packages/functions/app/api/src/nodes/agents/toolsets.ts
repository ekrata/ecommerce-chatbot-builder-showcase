export const toolKey = [
  'Product Search',
  'Article Search',
  'Price Search',
  'Document Search',
  'Navigation Search',
] as const;

export const toolDescription = [
  'useful for when you need to answer questions about product information',
  'useful for when you need to answer poorly defined questions , or it seems like no other tool will work.',
  'useful for when you need to answer questions about product and services pricing',
  'useful for when you need to answer poorly defined questions , or when you cannot search articles.',
  'useful for when you need to find the url of a page that would help solve this issue, and also useful for finding product categories',
] as const;

export type ToolKey = (typeof toolKey)[number];
export type ToolDescription = (typeof toolDescription)[number];
export const toolset: Record<ToolKey, ToolDescription> = {
  ['Product Search']:
    'useful for when you need to answer questions about product information',
  ['Document Search']:
    'useful for when you need to answer poorly defined questions , or when you cannot search articles.',
  ['Article Search']:
    'useful for when you need to answer poorly defined questions , or it seems like no other tool will work.',
  ['Price Search']:
    'useful for when you need to answer questions about product and services pricing',
  ['Navigation Search']:
    'useful for when you need to find the url of a page that would help solve this issue, and also useful for finding product categories',
};

export type Toolset = typeof toolset;
