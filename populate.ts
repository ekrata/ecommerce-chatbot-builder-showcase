import { getHttp } from './packages/functions/app/api/src/http';
import { MockOrgIds } from './packages/functions/app/api/src/util';

console.log('populating... ');
const http = getHttp(`${process.env.NEXT_PUBLIC_APP_API_URL}`);
let mockOrgIds: MockOrgIds[] = [];
http.post(`/util/small-seed-test-db`).then((data) => {
  console.log('Populated with entities: ', data?.data);
  console.log(
    'Populated with entities: ',
    data?.data?.[0]?.customers?.[0]?.conversations,
  );
  // data.data as MockOrgIds[];
});
