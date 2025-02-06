import {
  Abi,
  Chain,
  createPublicClient,
  createWalletClient,
  http,
  encodeFunctionData,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import {
  mainnet,
  tron,
  bsc,
  base,
  arbitrum,
  polygon,
  optimism,
  flowMainnet,
  avalanche,
} from 'wagmi/chains';
import { chainCoinGeckoIds, chainLogos } from './ChainConstants';

const WALLET_PRIVATE_KEY = process.env.DEPLOY_WALLET_1;
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY;

// Cache structure
type PriceCache = {
  price: number;
  timestamp: number;
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds
let priceCache: Record<string, PriceCache> = {};

// Update the Avalanche chain configuration with Ankr's RPC URL
const avalancheChain = {
  ...avalanche,
  rpcUrls: {
    ...avalanche.rpcUrls,
    default: {
      http: ['https://rpc.ankr.com/avalanche'],
    },
    public: {
      http: ['https://rpc.ankr.com/avalanche'],
    },
  },
};

async function getTokenPriceInUSD(chainName: string): Promise<number> {
  const geckoId = chainCoinGeckoIds[chainName];
  if (!geckoId) {
    throw new Error(`No CoinGecko ID found for chain: ${chainName}`);
  }

  // Check cache first
  const cached = priceCache[geckoId];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }

  try {
    if (!COINGECKO_API_KEY) {
      throw new Error('COINGECKO_API_KEY is not set in environment variables');
    }

    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${geckoId}&vs_currencies=usd`;
    console.log('Fetching price from:', url);

    const response = await fetch(url, {
      headers: {
        'x-cg-pro-api-key': COINGECKO_API_KEY,
        Accept: 'application/json',
      },
    });

    // Check if the response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error('CoinGecko API error details:', errorText);
      throw new Error(
        `CoinGecko API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    // Parse the response
    const data = await response.json();

    // Validate the data structure
    if (!data[geckoId] || typeof data[geckoId].usd !== 'number') {
      console.error('Invalid CoinGecko response:', data);
      throw new Error(`Invalid price data for ${geckoId}`);
    }

    const price = data[geckoId].usd;

    // Update cache
    priceCache[geckoId] = {
      price,
      timestamp: Date.now(),
    };

    return price;
  } catch (error) {
    console.error(`Failed to fetch price for ${chainName}:`, error);
    // Return a fallback price or throw
    if (cached) {
      console.log(`Using cached price for ${chainName} due to error`);
      return cached.price;
    }
    throw error;
  }
}

export type ChainCost = {
  chainName: string;
  logo: string;
  totalCost?: string; // Now represents USD value
  error?: string;
};

export async function estimateContractCallCosts(contractDetails: {
  address: `0x${string}`;
  abi: Abi;
  functionName: string;
  args?: any[];
  chain: Chain;
}): Promise<ChainCost> {
  if (!WALLET_PRIVATE_KEY) {
    throw new Error('WALLET_PRIVATE_KEY is not set');
  }
  const account = privateKeyToAccount(WALLET_PRIVATE_KEY as `0x${string}`);
  const walletClient = createWalletClient({
    chain: contractDetails.chain,
    transport: http(),
    account,
  });

  // Log the address of the wallet client
  console.log(`Wallet client address: ${walletClient.account.address}`);

  try {
    // Check for Avalanche size limits
    if (contractDetails.chain.id === avalanche.id) {
      // Check args length - assuming the base64 string is the second argument
      if (
        contractDetails.args &&
        contractDetails.args[1] &&
        typeof contractDetails.args[1] === 'string'
      ) {
        // Avalanche has an 8M gas limit
        // Being conservative, let's limit to 8KB to account for other transaction costs
        const base64String = contractDetails.args[1];
        if (base64String.length > 8 * 1024) {
          return {
            chainName: contractDetails.chain.name,
            logo: chainLogos[contractDetails.chain.name] || '',
            error: `Transaction data too large for Avalanche. Maximum size: ~8KB`,
          };
        }
      }
    }

    const chain =
      contractDetails.chain.id === avalanche.id
        ? avalancheChain
        : contractDetails.chain;

    console.log('Using chain config:', chain);

    const publicClient = createPublicClient({
      chain,
      transport: http(),
    });

    console.log('Estimating gas for:', {
      address: contractDetails.address,
      functionName: contractDetails.functionName,
      args: contractDetails.args,
    });

    const gasEstimate = await publicClient.estimateGas({
      account: walletClient.account.address,
      to: contractDetails.address,
      data: encodeFunctionData({
        abi: contractDetails.abi,
        functionName: contractDetails.functionName,
        args: contractDetails.args || [],
      }),
    });

    const feeData = await publicClient.estimateFeesPerGas();
    const maxFeePerGas = feeData?.maxFeePerGas || BigInt(0);

    const totalWei = gasEstimate * maxFeePerGas;
    const totalEth = Number(totalWei) / 1e18;

    // Get the current price in USD
    const priceInUSD = await getTokenPriceInUSD(contractDetails.chain.name);
    const costInUSD = totalEth * priceInUSD;

    return {
      chainName: contractDetails.chain.name,
      logo: chainLogos[contractDetails.chain.name] || '',
      totalCost: costInUSD.toFixed(5), // Format to 2 decimal places
    };
  } catch (error) {
    console.error(error);

    // Show full error only for Avalanche's size error
    if (
      contractDetails.chain.id === avalanche.id &&
      error instanceof Error &&
      error.message?.includes('size')
    ) {
      return {
        chainName: contractDetails.chain.name,
        logo: chainLogos[contractDetails.chain.name] || '',
        error: error.message,
      };
    }

    // Simplified error messages for all other cases
    if (
      error instanceof Error &&
      error.message?.includes('Execution reverted')
    ) {
      return {
        chainName: contractDetails.chain.name,
        logo: chainLogos[contractDetails.chain.name] || '',
        error: 'Execution reverted for an unknown reason',
      };
    }

    if (error instanceof Error && error.message?.includes('CoinGecko')) {
      return {
        chainName: contractDetails.chain.name,
        logo: chainLogos[contractDetails.chain.name] || '',
        error: 'Unable to get price from CoinGecko',
      };
    }

    return {
      chainName: contractDetails.chain.name,
      logo: chainLogos[contractDetails.chain.name] || '',
      error: 'Unexpected error',
    };
  }
}
