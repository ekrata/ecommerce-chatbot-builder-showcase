import axios from 'axios';

export const getHttp = (url: string) =>
  axios.create({
    baseURL: url,
    timeout: 100000,
  });
