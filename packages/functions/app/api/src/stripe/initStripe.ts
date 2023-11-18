import { getHttp } from '../http';

console.log('creating stripe items... ');
const http = getHttp(`${process.env.NEXT_PUBLIC_APP_API_URL}`);

// http
//   .post(`/stripe/create-payment-links`, prices, {
//     timeout: 1000000,
//   })
//   .then((res: any) => {
//     // data.data as MockOrgIds[];
//   })
//   .catch((err) => {
//     // console.log(err);
//   });
http
  .post(`/stripe/create-prices`, {}, { timeout: 1000000 })
  .then((res: any) => {
    if (res?.data) {
      console.log(res.data);
      setTimeout(
        () =>
          http
            .post(`/stripe/create-payment-links`, res?.data, {
              timeout: 1000000,
            })
            .then((res: any) => {
              // data.data as MockOrgIds[];
            })
            .catch((err) => {
              // console.log(err);
            }),
        // data.data as MockOrgIds[];
        1000,
      );
    }
  })
  .catch((err) => {
    // console.log(err);
  });
