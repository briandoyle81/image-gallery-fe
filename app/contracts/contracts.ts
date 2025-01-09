import { useMemo } from "react";
import { Abi } from "viem";

import personalImageGalleryFactory from "./PersonalImageGalleryFactory#PersonalImageGalleryFactory.json";
import personalImageGallery from "./PersonalImageGallery#PersonalImageGallery.json";
import addresses from "./deployed_addresses.json";

export default function useContracts() {
    return useMemo(() => {
        return {
            personalImageGalleryFactory: {
                address: addresses["PersonalImageGalleryFactory#PersonalImageGalleryFactory"] as `0x${string}`,
                abi: personalImageGalleryFactory.abi as Abi,
            },
            personalImageGallery: {
                abi: personalImageGallery.abi as Abi,
            }
        };
    }, []);
}

