import axios from 'axios';

import {
  apiBaseUrl, apiCurrencyResponseUrl, apiMultipleCurrencyBaseUrl, apiMulitpleResponseUrl,
} from '../../../../constants/Api';

import {
  FETCHING_COIN_DATA,
  FETCHING_COIN_DATA_SUCCESS,
  FETCHING_COIN_DATA_FAIL,
  FETCHING_ETH_PRICE_DATA,
  FETCHING_ETH_PRICE_DATA_SUCCESS,
  FETCHING_ETH_PRICE_DATA_FAIL,
  SET_WALLET_TOKENS_BALANCES,
  CALCULATE_WALLET_BALANCE,
} from '../types/FetchCoinData';

/**
 * Pass in Array of symbol and amount of tokens
 * @param {} symbol 
 */
export function fetchCoinData(tokensString) {
  return (dispatch) => {
    dispatch({ type: FETCHING_COIN_DATA });
    return axios.get(`${apiMultipleCurrencyBaseUrl}${tokensString}${apiMulitpleResponseUrl}`)
      .then((res) => {
				console.log("conversion matrix", res.data);
        dispatch({ type: FETCHING_COIN_DATA_SUCCESS, payload: res.data });
      })
      .catch((err) => {
        dispatch({ type: FETCHING_COIN_DATA_FAIL, payload: err.data });
      });
  };
}

/**
 * Called when app initially Loads to save current prices in store for when needed.
 * The app initially defaults all newly created or recovered wallets to ETH upon setup completition.
 * Once the a wallet is recovered, the wallet balance can calculated instantly without any additional api requests.
 * This removes the intial API call when the main app screen loads/when the flatlist needs an initial refresh.
 */
export function FetchEthPriceData() {
  return (dispatch) => {
    dispatch({ type: FETCHING_ETH_PRICE_DATA });
    return axios.get(`${apiBaseUrl}ETH${apiCurrencyResponseUrl}`)
      .then((res) => {
        dispatch({ type: FETCHING_ETH_PRICE_DATA_SUCCESS, payload: res.data });
      })
      .catch((err) => {
        dispatch({ type: FETCHING_ETH_PRICE_DATA_FAIL, payload: err.data });
      });
  };
}

export function setWalletTokenBalances(usersTokensWithBalances) {
  return (dispatch) => {
    dispatch({ type: SET_WALLET_TOKENS_BALANCES, payload: usersTokensWithBalances });
  };
}

/**
 * Loop through the amount of tokens the user has
 * Loop through all the conversions
 * Create a total balance object that has all 5 currencies
 * @param {} tokenQuantities 
 * @param {*} tokenConversionMatrix 
 */
export function calculateWalletBalance(tokenQuantities, tokenConversionMatrix) {
	return (dispatch) => {
		// moved balance calculations into a function
		const { walletBalanceObject, tokenPrices } = calculateBalances(tokenQuantities, tokenConversionMatrix);
		dispatch({ type: CALCULATE_WALLET_BALANCE, payload: { walletBalanceObject, tokenPrices } });
	};
}

// wallet balance calculation function
function calculateBalances(tokenQuantities, tokenConversionMatrix) {
	const tokenKeys = Object.keys(tokenConversionMatrix);
	let walletBalanceObject = {
		USD: 0,
		CAD: 0,
		EUR: 0,
		BTC: 0,
		ETH: 0,
	};
	let tokenPrices = [];
	for (let i = 0; i < tokenQuantities.length; i++) {
		let keyTracker = 0;
		for (let matrixKey = 0; matrixKey < tokenKeys.length; matrixKey++) {
			const currentTokenKey = tokenKeys[matrixKey];
			if (currentTokenKey === tokenQuantities[i].symbol) {
				let tokenPriceObject = {
					USD: 0,
					CAD: 0,
					EUR: 0,
					BTC: 0,
					ETH: 0,
				};
				walletBalanceObject.USD += tokenQuantities[i].amount * tokenConversionMatrix[currentTokenKey].USD;
				walletBalanceObject.CAD += tokenQuantities[i].amount * tokenConversionMatrix[currentTokenKey].CAD;
				walletBalanceObject.EUR += tokenQuantities[i].amount * tokenConversionMatrix[currentTokenKey].EUR;
				walletBalanceObject.BTC += tokenQuantities[i].amount * tokenConversionMatrix[currentTokenKey].BTC;
				walletBalanceObject.ETH += tokenQuantities[i].amount * tokenConversionMatrix[currentTokenKey].ETH;
				tokenPriceObject.USD = tokenQuantities[i].amount * tokenConversionMatrix[currentTokenKey].USD;
				tokenPriceObject.CAD = tokenQuantities[i].amount * tokenConversionMatrix[currentTokenKey].CAD;
				tokenPriceObject.EUR = tokenQuantities[i].amount * tokenConversionMatrix[currentTokenKey].EUR;
				tokenPriceObject.BTC = tokenQuantities[i].amount * tokenConversionMatrix[currentTokenKey].BTC;
				tokenPriceObject.ETH = tokenQuantities[i].amount * tokenConversionMatrix[currentTokenKey].ETH;
				tokenPriceObject.symbol = currentTokenKey;
				tokenPrices.push(tokenPriceObject);
				break;
			} else {
				keyTracker++;
			}
			if (keyTracker < (matrixKey.length)) {
				console.log('you good', tokenQuantities[i].symbol);
			} else {
				let tokenPriceObject = {
					USD: 0,
					CAD: 0,
					EUR: 0,
					BTC: 0,
					ETH: 0,
				};
				tokenPriceObject.symbol = tokenQuantities[i].symbol;
				tokenPrices.push(tokenPriceObject);
			}
		}
	}
	return { walletBalanceObject, tokenPrices }
}
