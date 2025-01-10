'use client';

import React, { useEffect, useState } from "react";

type AddressDropdownProps = {
  addresses: string[]; // Array of EVM addresses
  handleSetActiveAddress: (address: string) => void;
};

const AddressDropdown: React.FC<AddressDropdownProps> = ({ addresses, handleSetActiveAddress }) => {
  const [selectedAddress, setSelectedAddress] = useState("");

  useEffect(() => {
    if (selectedAddress) {
      console.log(selectedAddress);
      handleSetActiveAddress(selectedAddress);
    }
  }, [selectedAddress, handleSetActiveAddress]);

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-2xl font-bold text-center mb-6">Select a Gallery</h1>
      <div className="flex flex-col items-center space-y-4">
        <select
          value={selectedAddress}
          onChange={(e) => setSelectedAddress(e.target.value)}
          className="w-full max-w-md border border-gray-300 rounded-lg p-2 bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {addresses.map((address, index) => (
            <option key={index} value={address}>
              {address}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AddressDropdown;
