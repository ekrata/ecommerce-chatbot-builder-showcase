import { getHttp } from './packages/functions/app/api/src/http';
import { MockOrgIds } from './packages/functions/app/api/src/util';

console.log('populating... ');
console.log(process.env.NEXT_PUBLIC_APP_API_URL);
const http = getHttp(`${process.env.NEXT_PUBLIC_APP_API_URL}`);
let mockOrgIds: MockOrgIds[] = [];
http.post(`/util/small-seed-test-db`).then((data) => {
  console.log('Populated with entities: ', data?.data);
  console.log(
    'Populated with entities: ',
    data?.data?.[0]?.customers?.[0]?.conversations,
  );
  // http.post(`nodes/create-article-vector-store`).then((data) => {
  //   console.log('done');
  //   return data;
  // });
  // data.data as MockOrgIds[];
});
