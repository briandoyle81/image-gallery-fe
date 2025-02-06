import { Abi } from "viem";
import personalImageGalleryFactory from "./PersonalImageGalleryFactory#PersonalImageGalleryFactory.json";
import personalImageGallery from "./PersonalImageGallery#PersonalImageGallery.json";
import addresses from "./deployed_addresses.json";
import baseImageGallery from "./imageGalleries/base_address.json";
import mainnetImageGallery from "./imageGalleries/mainnet_address.json";
import polygonImageGallery from "./imageGalleries/polygon_address.json";
import optimismImageGallery from "./imageGalleries/optimism_address.json";
import arbitrumImageGallery from "./imageGalleries/arbitrum_address.json";
import avalancheImageGallery from "./imageGalleries/avalanche_address.json";
import bnbImageGallery from "./imageGalleries/bnb_address.json";

export const contractData = {
    personalImageGalleryFactory: {
        address: addresses["PersonalImageGalleryFactory#PersonalImageGalleryFactory"] as `0x${string}`,
        abi: personalImageGalleryFactory.abi as Abi,
    },
    personalImageGallery: {
        abi: personalImageGallery.abi as Abi,
    },
    baseImageGallery: {
        abi: personalImageGallery.abi as Abi,
        address: baseImageGallery["PersonalImageGallery#PersonalImageGallery"] as `0x${string}`,
    },
    flowImageGallery: {
        abi: personalImageGallery.abi as Abi,
        address: addresses["PersonalImageGallery#PersonalImageGallery"] as `0x${string}`,
    },
    mainnetImageGallery: {
        abi: personalImageGallery.abi as Abi,
        address: mainnetImageGallery["PersonalImageGallery#PersonalImageGallery"] as `0x${string}`,
    },
    polygonImageGallery: {
        abi: personalImageGallery.abi as Abi,
        address: polygonImageGallery["PersonalImageGallery#PersonalImageGallery"] as `0x${string}`,
    },
    optimismImageGallery: {
        abi: personalImageGallery.abi as Abi,
        address: optimismImageGallery["PersonalImageGallery#PersonalImageGallery"] as `0x${string}`,
    },
    arbitrumImageGallery: {
        abi: personalImageGallery.abi as Abi,
        address: arbitrumImageGallery["PersonalImageGallery#PersonalImageGallery"] as `0x${string}`,
    },
    avalancheImageGallery: {
        abi: personalImageGallery.abi as Abi,
        address: avalancheImageGallery["PersonalImageGallery#PersonalImageGallery"] as `0x${string}`,
    },
    bnbImageGallery: {
        abi: personalImageGallery.abi as Abi,
        address: bnbImageGallery["PersonalImageGallery#PersonalImageGallery"] as `0x${string}`,
    }
}; 
