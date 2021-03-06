import { expiresInMinutes } from './general';
// import { randomResource } from 'utils';
import { sortBy, reverse } from 'lodash';

// Coins are fetched at this interval
export const checkForUpdatesInterval = (1000 * 60) * expiresInMinutes;

// specific to coingecko
export const COIN_CHANGE_KEY = 'price_change_percentage_24h';

export const coinPerformanceRanges = [
  [undefined, -10], // big dumps
  [-10, -8],
  [-8, -2],
  [-2, 0],
  [0, 2],
  [2, 8],
  [8, 10],
  [10, undefined], // big pumps
];

export const coinHasBigPump = (coin) => {
  return getItemIsInCoinRange(coin[COIN_CHANGE_KEY], coinPerformanceRanges.slice(-1));
}

export const coinHasBigDump = (coin) => {
  return getItemIsInCoinRange(coin[COIN_CHANGE_KEY], coinPerformanceRanges[0]);
}

export const getItemIsInCoinRange = (num, range) => {
  const [min, max] = range;
  return num > (min === undefined ? num-1 : min) && num <= (max === undefined ? num+1 : max);
}

export const getPumpsAndDumpsFromArr = ({coins, qty}) => {
  if (!coins || !qty || coins.length === 0) {
    // console.error('coins and qty are required in getPumpsAndDumpsFromArr');
    return [[],[]];
  }

  const sorted = sortBy(coins, [COIN_CHANGE_KEY]);
  const pumps = reverse(sorted.slice(-qty));
  const dumps = sorted.slice(0, qty);
  // const pumps = [randomResource(sorted), randomResource(sorted), randomResource(sorted), randomResource(sorted), randomResource(sorted)]
  return [pumps, dumps];
}

export const getTotalChangeFromCoinsResponse = (coins) => {
  if (!coins) {
    return;
  }
  return coins.reduce((a,c) => {
    return a + c[COIN_CHANGE_KEY];
  }, 0) / coins.length
}
