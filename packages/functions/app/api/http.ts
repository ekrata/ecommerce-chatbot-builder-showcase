import { Api } from 'sst/node/api';
import axios from 'axios';

export const http = axios.create({
  baseURL: `${Api.api.url}`,
  timeout: 100000,
});
