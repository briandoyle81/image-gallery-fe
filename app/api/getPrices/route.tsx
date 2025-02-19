import { NextRequest, NextResponse } from 'next/server';
import {
  estimateContractCallCosts,
  ChainCost,
} from '@/app/util/EstimateTxCosts';
import { contractData } from '@/app/contracts/contractData';
import {
  mainnet,
  avalanche,
  base,
  bsc,
  arbitrum,
  polygon,
  flowMainnet,
} from 'wagmi/chains';

// Rather than passing a big string to the server, we mock the data from the length
// since we're not actually storing the image data on the chain from this call.

function mockBase64StringWithAs(length: number): string {
  // Create a string of 'A's with the desired length
  let mockString = 'A'.repeat(length);

  // Ensure the length is a multiple of 4 by adding padding `=` if necessary
  const paddingLength = (4 - (mockString.length % 4)) % 4;
  mockString += '='.repeat(paddingLength);

  return mockString;
}

export async function POST(request: NextRequest) {
  const {
    baseImageGallery,
    bscImageGallery: bnbImageGallery,
    flowImageGallery,
    mainnetImageGallery,
    polygonImageGallery,
    arbitrumImageGallery,
    avalancheImageGallery,
  } = contractData;

  try {
    const { base64ImageStringLength } = await request.json();

    if (
      !base64ImageStringLength ||
      typeof base64ImageStringLength !== 'number'
    ) {
      return NextResponse.json(
        { error: 'base64ImageStringLength is required and must be a number' },
        { status: 400 }
      );
    }

    const costs: ChainCost[] = [];

    const mockedImage = mockBase64StringWithAs(base64ImageStringLength);
    //Log the size in kb
    console.log(`Mocked image size: ${mockedImage.length / 1024} KB`);

    costs.push(
      await estimateContractCallCosts({
        chain: mainnet,
        address: mainnetImageGallery.address,
        abi: mainnetImageGallery.abi,
        functionName: 'addImage',
        args: ['', mockedImage],
      })
    );

    costs.push(
      await estimateContractCallCosts({
        chain: base,
        address: baseImageGallery.address,
        abi: baseImageGallery.abi,
        functionName: 'addImage',
        args: ['', mockedImage],
      })
    );

    costs.push(
      await estimateContractCallCosts({
        chain: polygon,
        address: polygonImageGallery.address,
        abi: polygonImageGallery.abi,
        functionName: 'addImage',
        args: ['', mockedImage],
      })
    );

    costs.push(
      await estimateContractCallCosts({
        chain: arbitrum,
        address: arbitrumImageGallery.address,
        abi: arbitrumImageGallery.abi,
        functionName: 'addImage',
        args: ['', mockedImage],
      })
    );

    costs.push(
      await estimateContractCallCosts({
        chain: avalanche,
        address: avalancheImageGallery.address,
        abi: avalancheImageGallery.abi,
        functionName: 'addImage',
        args: ['', mockedImage],
      })
    );

    costs.push(
      await estimateContractCallCosts({
        chain: bsc,
        address: bnbImageGallery.address,
        abi: bnbImageGallery.abi,
        functionName: 'addImage',
        args: ['', mockedImage],
      })
    );

    costs.push(
      await estimateContractCallCosts({
        chain: flowMainnet,
        address: flowImageGallery.address,
        abi: flowImageGallery.abi,
        functionName: 'addImage',
        args: ['', mockedImage],
      })
    );

    costs.push({
      chainName: 'Flow Sponsored by Flow Wallet',
      logo: '/chain-logos/flow-flow-logo.png',
      totalCost: '0.00000',
    });

    return NextResponse.json(costs);
  } catch (error) {
    console.error('Error estimating costs:', error);
    return NextResponse.json(
      { error: 'Failed to estimate costs' },
      { status: 500 }
    );
  }
}
