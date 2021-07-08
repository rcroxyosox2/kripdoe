require('../db');
const moment = require('moment');
const Coin = require('../models/Coin');
const { caps, capSizes, getNextCapSize, CURRENCY, COIN_CHANGE_KEY } = require('../contants');
const SICK_DEAL_MINIMUM_PERC = -10;

const getCoin = (query = {}) => {
  return Coin.Schema.find(query).limit(1);
}

const getCoinEventCount = async (coinId) => {
  const x = await Coin.Schema.findOne({id: coinId}).select('stolen_events');
  return x.stolen_events.count;
}


const getSickDealCoins = async () => {
  const { Schema, capSizes, caps } = Coin;
  const sort = {"ath_change_percentage": 1};
  const LIMIT = 10;
  const fields = [
    'id',
    'name',
    'symbol',
    'image',
    'current_price',
    'ath_change_percentage',
  ].join(' ');
  
  const requirement = {
    $lt: SICK_DEAL_MINIMUM_PERC,
  };
  
  // const tinyCaps = Schema.find({
  //   "market_cap": {
  //     $gte: capSizes[caps.TINY], 
  //     $lt: capSizes[caps.SM]
  //   },
  //   "genesis_date": {
  //     "$lte": moment().add(1, "year").toDate(),
  //   },
  //   "ath_change_percentage": requirement
  // }).sort(sort).limit(50);

  const smallCaps = Schema.find({
    "market_cap": {
      $gte: capSizes[caps.SM], 
      $lt: capSizes[caps.MID]
    },
    "genesis_date": {
      "$lte": moment().add(1, "year").toDate(),
    },
    "ath_change_percentage": requirement
  }).select(fields).sort(sort).limit(LIMIT);

  const midCaps = Schema.find({
    "market_cap": {
      $gte: capSizes[caps.MID], 
      $lt: capSizes[caps.LRG]
    },
    "ath_change_percentage": requirement
  }).select(fields).sort(sort).limit(LIMIT);

  const lrgCaps = Schema.find({
    "market_cap": {
      $gte: capSizes[caps.LRG], 
    },
    "ath_change_percentage": requirement
  }).select(fields).sort(sort).limit(LIMIT);

  return await Promise.all([
    smallCaps,
    midCaps,
    lrgCaps
  ]).then((res) => {
    const [sm, mid, lrg] = res;
    return {
      [caps.SM]: sm,
      [caps.MID]: mid,
      [caps.LRG]: lrg,
    }
  })
}

const getAvg24hrPriceChangePerc = async () => {
  const docs = await Coin.Schema.aggregate([
    { 
      $match: {
        price_change_percentage_24h: {
          $exists: true
        },
        market_cap_rank: {
          $lt: 100
        }
      }
    },
    {
      $group: {
        _id: null,
        avgChangePerc24hr: {
          $avg: "$price_change_percentage_24h"
        }
      }
    }
  ]);

  return { avgChangePerc24hr: docs[0].avgChangePerc24hr };
}

const searchCoinsWithAutocomplete = (term) => {
  return Coin.Schema.aggregate([
    {
      '$search': {
        'index': 'coinsearch', 
        'compound': {
          'should': [
            {
              'autocomplete': {
                'query': `${term}`, 
                'path': 'name'
              }
            }, {
              'autocomplete': {
                'query': `${term}`, 
                'path': 'symbol'
              }
            }
          ]
        }
      }
    }, {
      '$project': {
        id: 1,
        name: 1,
        symbol: 1,
        image: 1,
        sparkline_in_7d: 1,
        community_score: 1,
        current_price: 1,
        [COIN_CHANGE_KEY]: 1,
      }
    }, {
      '$sort': {
        'community_score': -1
      }
    }, {
      '$limit': 5
    }
  ])
}

const getRedGreensByQuery = ({redOrGreen = 'red', cap = caps.LRG, maxResults = 10} = {}) => {
  const sort = {"price_change_percentage_24h": (redOrGreen === 'red') ? 1 : -1 };
  if (!Object.values(caps).includes(cap)) {
    throw new Error(`${cap} not found in ${caps}`);
    return;
  }

  const query = {
    $gte: capSizes[cap],
  };

  const nextCapSize = getNextCapSize(cap);
  if (nextCapSize) {
    query['$lt'] = capSizes[nextCapSize];
  };

  return Coin.Schema.find({
    'market_cap': query,
    'price_change_percentage_24h': (
      (redOrGreen === 'red') 
      ? {"$lt" : 0} 
      : {"$gt" : 0}),
  }).sort(sort).limit(maxResults);
}

const getRedGreens = () => {
  const LIMIT = 20;
  return Coin.Schema.aggregate([
    {
      $facet: {
        smallCapReds: [{
          $match: {
              price_change_percentage_24h: {
                $lt: 0
              },
              market_cap: {
                $gte: capSizes[caps.SM],
                $lte: capSizes[caps.MID]
              }
            }
          },
          {$sort: {price_change_percentage_24h:1}},
          {$limit: LIMIT},
        ],
        smallCapGreens: [{
          $match: {
              price_change_percentage_24h: {
                $gt: 0
              },
              market_cap: {
                $gte: capSizes[caps.SM],
                $lte: capSizes[caps.MID]
              }
            }
          },
          {$sort: {price_change_percentage_24h:-1}},
          {$limit: LIMIT},
        ],
       midCapReds: [{
          $match: {
              price_change_percentage_24h: {
                $lt: 0
              },
              market_cap: {
                $gte: capSizes[caps.MID],
                $lte: capSizes[caps.LRG]
              }
            }
          },
          {$sort: {price_change_percentage_24h:1}},
          {$limit: LIMIT},
        ],
        midCapGreens: [{
          $match: {
              price_change_percentage_24h: {
                $gt: 0
              },
              market_cap: {
                $gte: capSizes[caps.MID],
                $lte: capSizes[caps.LRG]
              }
            }
          },
          {$sort: {price_change_percentage_24h:-1}},
          {$limit: LIMIT},
        ],
        lrgCapReds: [{
          $match: {
              price_change_percentage_24h: {
                $lt: 0
              },
              market_cap: {
                $gte: capSizes[caps.LRG]
              }
            }
          },
          {$sort: {price_change_percentage_24h:1}},
          {$limit: LIMIT},
        ],
        lrgCapGreens: [{
          $match: {
              price_change_percentage_24h: {
                $gt: 0
              },
              market_cap: {
                $gte: capSizes[caps.LRG]
              }
            }
          },
          {$sort: {price_change_percentage_24h:-1}},
          {$limit: LIMIT},
        ],
      }
    }
  ])
}

// (async function() {
//   const x = await Coin.Schema.findOne({id: 'bitcoin'}).select('stolen_events');
//   return x.stolen_events.count;
// })();


// (async function() {
//   const term = 'bitcoin';
//   const timetaken = "Time taken by addCount coin agg search";
//   console.time(timetaken);
//   await Coin.Schema.aggregate([
//     {
//       '$search': {
//         'index': 'coinsearch', 
//         'compound': {
//           'should': [
//             {
//               'autocomplete': {
//                 'query': `${term}`, 
//                 'path': 'name'
//               }
//             }, {
//               'autocomplete': {
//                 'query': `${term}`, 
//                 'path': 'symbol'
//               }
//             }
//           ]
//         }
//       }
//     }, {
//       '$limit': 10
//     }
//   ])
//   console.timeEnd(timetaken);
// })();

module.exports = { 
  getCoin,
  getSickDealCoins,
  getAvg24hrPriceChangePerc,
  searchCoinsWithAutocomplete,
  getCoinEventCount,
  getRedGreens
};
