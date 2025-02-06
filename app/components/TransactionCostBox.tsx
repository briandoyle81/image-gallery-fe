'use client';

import React from 'react';
import { ChainCost } from '../util/EstimateTxCosts';

type TransactionCostBoxProps = {
  costDetails: ChainCost[];
};

const TransactionCostBox: React.FC<TransactionCostBoxProps> = ({
  costDetails
}) => {


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {costDetails.length > 0 ? (
        costDetails.map((chain) => (
          <div
            key={chain.chainName}
            className="bg-white shadow-md rounded-lg p-4 flex items-center space-x-4"
          >
            <img
              src={chain.logo}
              alt={`${chain.chainName} logo`}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="text-lg font-semibold">{chain.chainName}</h3>
              {chain.error ? (
                <p className="text-red-500 text-sm">Error: {chain.error}</p>
              ) : (
                <p className="text-gray-700">
                  Cost: {chain.chainName === "Flow Sponsored by Flow Wallet" ? (
                    <span className="font-mono"><s>$0.00 USD</s> <strong>FREE!</strong></span>
                  ) : (
                    <span className="font-mono">${chain.totalCost || '--.-'} USD</span>
                  )}
                </p>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-500 text-center">
          Upload an image to see the estimated costs
        </div>
      )}
    </div>
  );
};

export default TransactionCostBox;
