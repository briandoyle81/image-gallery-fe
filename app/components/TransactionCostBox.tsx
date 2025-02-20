'use client';

import React from 'react';
import Image from 'next/image';
import { ChainCost } from '../util/EstimateTxCosts';

type TransactionCostBoxProps = {
  costDetails: ChainCost[];
  isLoading?: boolean;
};

function getCostDetails(costDetails: ChainCost[]) {
  // If we're in a mobile view, return the last item and one other random item
  if (window.innerWidth < 640) {
    const lastItem = costDetails[costDetails.length - 1];
    // Pick an item that changes every 5 minutes
    const randomIndex = Math.floor(Date.now() / 300000) % (costDetails.length - 1);
    const randomItem = costDetails[randomIndex];
    return [randomItem, lastItem];
  }
  return costDetails;
}

const TransactionCostBox: React.FC<TransactionCostBoxProps> = ({
  costDetails,
  isLoading = false,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {getCostDetails(costDetails).map((chain) => (
        <div
          key={chain.chainName}
          className="bg-white shadow-md rounded-lg p-4 flex items-center space-x-4"
        >
          <div className="relative w-12 h-12">
            <Image
              src={chain.logo}
              alt={`${chain.chainName} logo`}
              fill
              className="rounded-full object-contain"
              sizes="48px"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{chain.chainName}</h3>
            {isLoading ? (
              <div className="animate-pulse h-6 w-24 bg-gray-200 rounded"></div>
            ) : chain.error ? (
              <p className="text-red-500 text-sm">Error: {chain.error}</p>
            ) : (
              <p className="text-gray-700">
                {chain.chainName === 'Flow Wallet' ? (
                  <span className="font-mono">
                    <s>$0.00 USD</s> <strong>FREE!</strong>
                  </span>
                ) : (
                  <span className="font-mono">
                    $
                    {Number(chain.totalCost) > 0.01
                      ? Number(chain.totalCost).toFixed(2)
                      : chain.totalCost || '--.-'}{' '}
                    USD
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionCostBox;
