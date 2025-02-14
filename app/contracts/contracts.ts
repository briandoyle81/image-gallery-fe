import { useMemo } from "react";
import { contractData } from "./contractData";

export default function useContracts() {
  return useMemo(() => contractData, []);
}

