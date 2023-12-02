import { getHttp } from './packages/functions/app/api/src/http';
import { MockOrgIds } from './packages/functions/app/api/src/util';

console.log('populating... ');
const http = getHttp(`${process.env.NEXT_PUBLIC_APP_API_URL}`);
let mockOrgIds: MockOrgIds[] = [];
fetch(`${process.env.NEXT_PUBLIC_APP_API_URL}/util/dense-seed-test-db`, {
  method: 'POST',
}).then((res) => {
  console.log('Populated with entities: ', res?.body);
});
