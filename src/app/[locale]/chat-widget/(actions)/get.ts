import { Api } from 'sst/node/api';

export const getOrg = async (orgId: string) => {
  const res = await fetch(`https://${Api.appApi.url}/orgs/${orgId}`);
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return res.json();
};
