import { Api } from 'sst/node/api';

export const getOrg = async (orgId: string) => {
  const res = await fetch(
    `https://${process.env.NEXT_PUBLIC_APP_API_URL}/orgs/${orgId}`,
  );
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data');
  }
  return res.json();
};
