This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

[![Seed Status](https://api.seed.run/ekrata-main/marketing-app-next-js-sst/stages/prod/build_badge)](https://console.seed.run/ekrata-main/marketing-app-next-js-sst)

# Install 

```bash
pnpm i
```

# Start SST locally

```bash
pnpm sst dev
```

# Start next.js dev server

```bash
pnpm dev
```

# Seed sst & next.js dev server 

```bash
pnpm seed-dev
```

# NOTE: for meta conversations, there is no conversation id on meta side.
Instead, we use the senderId from meta, (PersonaId), PageId from meta, and operatorId from internal db to create a composite, deterministic conversationId if an action/webhook is the first interaction with this set of foreign entities.

# Adding new next-intl translations

First, navigate to the translations entity.
Then, add the new translation,
Finally execute `pnpm run-test-app-api` to copy the new translations to the /messsages translation folder.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

[http://localhost:3000/api/hello](http://localhost:3000/api/hello) is an endpoint that uses [Route Handlers](https://beta.nextjs.org/docs/routing/route-handlers). This endpoint can be edited in `app/api/hello/route.ts`.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

# DynamoDB NoSQL single table design

- [Strategies for mapping relationships with Single Table DDB](https://www.youtube.com/watch?v=BnDKD_Zv0og&ab_channel=AWSPortsmouthUserGroup)

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
