This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## WARNING

This is not a production-ready application. It is a rough demo with poor styling and hydration errors that are suppressed.

It is fun though!

It will not be maintained consistently, but please open an issue in the [Flow docs site](https://github.com/onflow/docs/issues) if it breaks completely.

I'm also happy to accept PRs here, but ask before spending a lot of time. I don't want this to be "better" if it also becomes more complex.

## Getting Started

If you want to connect to your own contracts, update [contracts.ts](app/contracts/contracts.ts) and the related imports for addresses and abis. You do **not** need an address for the galleries themselves, those will be pulled from the gallery factory.

Add a `.env` and put your WalletConnect ID in `NEXT_PUBLIC_WALLETCONNECT_ID`

```bash
npm install
npm run dev
```
