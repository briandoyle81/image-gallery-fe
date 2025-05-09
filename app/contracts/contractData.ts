import { Abi } from 'viem';
import personalImageGalleryFactory from './PersonalImageGalleryFactory#PersonalImageGalleryFactory.json';
import personalImageGallery from './PersonalImageGallery#PersonalImageGallery.json';
import galleryMinter from './minter/GalleryMinter#GalleryMinter.json';
import galleryMinterFactory from './minter/MinterFactory#MinterFactory.json';

// import flowImageGalleryFactory from './imageGalleryFactories/flow_address.json';
import polygonImageGalleryFactory from './imageGalleryFactories/polygon-address.json';
import baseImageGalleryFactory from './imageGalleryFactories/base-address.json';
import arbitrumImageGalleryFactory from './imageGalleryFactories/arbitrum-address.json';
import bscImageGalleryFactory from './imageGalleryFactories/bsc-address.json';

import baseImageGallery from './imageGalleries/base_address.json';
import mainnetImageGallery from './imageGalleries/mainnet_address.json';
import polygonImageGallery from './imageGalleries/polygon_address.json';
import optimismImageGallery from './imageGalleries/optimism_address.json';
import arbitrumImageGallery from './imageGalleries/arbitrum_address.json';
import bscImageGallery from './imageGalleries/bsc_address.json';
import flowImageGallery from './imageGalleries/flow_address.json';

import flowMinterAddresses from './minter/deployed_addresses.json';

export const contractData = {
  // flowImageGalleryFactory: {
  //   address: flowImageGalleryFactory[
  //     'PersonalImageGalleryFactory#PersonalImageGalleryFactory'
  //   ] as `0x${string}`,
  //   abi: personalImageGalleryFactory.abi as Abi,
  // },
  // The minter factory is a drop-in replacement covering all old functionality
  flowMinterFactory: {
    address: flowMinterAddresses[
      'MinterFactory#MinterFactory'
    ] as `0x${string}`,
    abi: galleryMinterFactory.abi as Abi,
  },
  polygonImageGalleryFactory: {
    address: polygonImageGalleryFactory[
      'PersonalImageGalleryFactory#PersonalImageGalleryFactory'
    ] as `0x${string}`,
    abi: personalImageGalleryFactory.abi as Abi,
  },
  baseImageGalleryFactory: {
    address: baseImageGalleryFactory[
      'PersonalImageGalleryFactory#PersonalImageGalleryFactory'
    ] as `0x${string}`,
    abi: personalImageGalleryFactory.abi as Abi,
  },
  arbitrumImageGalleryFactory: {
    address: arbitrumImageGalleryFactory[
      'PersonalImageGalleryFactory#PersonalImageGalleryFactory'
    ] as `0x${string}`,
    abi: personalImageGalleryFactory.abi as Abi,
  },
  bscImageGalleryFactory: {
    address: bscImageGalleryFactory[
      'PersonalImageGalleryFactory#PersonalImageGalleryFactory'
    ] as `0x${string}`,
    abi: personalImageGalleryFactory.abi as Abi,
  },
  personalImageGallery: {
    abi: personalImageGallery.abi as Abi,
  },
  galleryMinter: {
    abi: galleryMinter.abi as Abi,
  },
  baseImageGallery: {
    abi: personalImageGallery.abi as Abi,
    address: baseImageGallery[
      'PersonalImageGallery#PersonalImageGallery'
    ] as `0x${string}`,
  },
  // Leave this alone, these are used for estimates
  flowImageGallery: {
    abi: personalImageGallery.abi as Abi,
    address: flowImageGallery[
      'PersonalImageGallery#PersonalImageGallery'
    ] as `0x${string}`,
  },
  mainnetImageGallery: {
    abi: personalImageGallery.abi as Abi,
    address: mainnetImageGallery[
      'PersonalImageGallery#PersonalImageGallery'
    ] as `0x${string}`,
  },
  polygonImageGallery: {
    abi: personalImageGallery.abi as Abi,
    address: polygonImageGallery[
      'PersonalImageGallery#PersonalImageGallery'
    ] as `0x${string}`,
  },
  optimismImageGallery: {
    abi: personalImageGallery.abi as Abi,
    address: optimismImageGallery[
      'PersonalImageGallery#PersonalImageGallery'
    ] as `0x${string}`,
  },
  arbitrumImageGallery: {
    abi: personalImageGallery.abi as Abi,
    address: arbitrumImageGallery[
      'PersonalImageGallery#PersonalImageGallery'
    ] as `0x${string}`,
  },
  bscImageGallery: {
    abi: personalImageGallery.abi as Abi,
    address: bscImageGallery[
      'PersonalImageGallery#PersonalImageGallery'
    ] as `0x${string}`,
  },
};
