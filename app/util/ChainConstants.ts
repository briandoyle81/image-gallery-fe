import {
  mainnet,
  bsc,
  base,
  arbitrum,
  polygon,
  flowMainnet,
} from 'wagmi/chains';

export const chainCoinGeckoIds: Record<string, string> = {
  [mainnet.name]: 'ethereum',
  [base.name]: 'ethereum', // Base uses ETH
  [polygon.name]: 'matic-network',
  [arbitrum.name]: 'ethereum', // Arbitrum uses ETH
  [bsc.name]: 'binancecoin',
  [flowMainnet.name]: 'flow', // Make sure this matches CoinGecko's ID
};

export const chainLogos: Record<string, string> = {
  [mainnet.name]: '/chain-logos/ethereum-eth-logo.png',
  [base.name]: '/chain-logos/Base_Network_Logo.png',
  [polygon.name]: '/chain-logos/polygon-matic-logo.png',
  [arbitrum.name]: '/chain-logos/arbitrum-arb-logo.png',
  [bsc.name]: '/chain-logos/binance-coin-bnb-logo.png',
  [flowMainnet.name]: '/chain-logos/flow-flow-logo.png',
};
