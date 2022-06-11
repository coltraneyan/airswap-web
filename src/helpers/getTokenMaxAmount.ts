import { TokenInfo } from "@uniswap/token-lists";

import { BigNumber } from "bignumber.js";
import { formatUnits } from "ethers/lib/utils";

import {
  nativeCurrencyAddress,
  nativeCurrencySafeTransactionFee,
} from "../constants/nativeCurrency";
import { BalancesState } from "../features/balances/balancesSlice";

const getTokenMaxAmount = (
  baseToken: string,
  balances: BalancesState,
  baseTokenInfo: TokenInfo
): string | null => {
  if (!balances.values[baseToken] || balances.values[baseToken] === "0") {
    return null;
  }

  const transactionFee =
    baseTokenInfo.address === nativeCurrencyAddress &&
    nativeCurrencySafeTransactionFee[baseTokenInfo.chainId];
  const formattedAmount = formatUnits(
    balances.values[baseToken] || "0",
    baseTokenInfo.decimals
  );

  if (transactionFee) {
    return new BigNumber(formattedAmount).minus(transactionFee).toString();
  }

  return formattedAmount;
};

export default getTokenMaxAmount;
