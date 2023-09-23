import { getHttp } from 'packages/functions/app/api/src/http';
import { MockOrgIds } from 'packages/functions/app/api/src/util';
import { Api } from 'sst/node/api';

// Seed db in vitest beforeAll, then use preexisitng ids
const http = getHttp(`${Api.appApi.url}`);
let mockOrgIds: MockOrgIds[] = [];
http.post(`/util/small-seed-test-db`).then((data) => data.data as MockOrgIds[]);
