import { getHttp } from './packages/functions/app/api/src/http';
import { MockOrgIds } from './packages/functions/app/api/src/util';

console.log(process.env.NEXT_PUBLIC_APP_API_URL);
console.log('creating vectors');
const http = getHttp(`${process.env.NEXT_PUBLIC_APP_API_URL}`);

http.post(`nodes/create-article-vector-store`).then((data) => {
  console.log('done');
  return data;
});
