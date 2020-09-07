import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react';

import axios from 'axios';

import { ASSETS } from '../constants/assets';

const UPDATE = 'UPDATE';

const PriceContext = createContext();

function usePriceContext() {
  return useContext(PriceContext);
}

function reducer(state, { type, payload }) {
  switch (type) {
    case UPDATE: {
      const prices = payload;

      const result = {};

      ASSETS.forEach(token => {
        const price = prices[`${token.symbol}-USDT`];

        if (price) {
          result[token.symbol] = price;
        }
      });

      return {
        ...state,
        ...result
      };
    }
    default: {
      throw Error(`Unexpected action type in PriceContext reducer: '${type}'.`);
    }
  }
}

export default function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, {});

  const update = useCallback(prices => {
    dispatch({ type: UPDATE, payload: prices });
  }, []);

  return (
    <PriceContext.Provider
      value={useMemo(() => {
        return {
          state,
          update
        };
      }, [state, update])}
    >
      {children}
    </PriceContext.Provider>
  );
}

export function Updater() {
  const { update } = usePriceContext();

  useEffect(() => {
    let stale = false;

    function get() {
      if (!stale) {
        getPrices().then(prices => {
          update(prices);
        });
      }
    }

    get();

    const pricePoll = setInterval(() => {
      get();
    }, 15000);

    return () => {
      stale = true;
      clearInterval(pricePoll);
    };
  }, [update]);

  return null;
}

export function useAllPrices() {
  const { state } = usePriceContext();
  return state;
}

const getPrices = async () => {
  try {
    const res = await axios.get(`https://network.jelly.market/api/v1/price/average`);
    return res.data;
  } catch (error) {
    console.log('PRICE_ERR: ', error);
    return {};
  }
};
