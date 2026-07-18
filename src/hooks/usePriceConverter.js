// src/hooks/usePriceConverter.js
import { useExchangeRate } from '../context/ExchangeRateContext';

export const usePriceConverter = () => {
  const { exchangeRate, isRateAvailable } = useExchangeRate();

  // Convertir USD a Bs
  const toBolivares = (usdAmount) => {
    if (!isRateAvailable || !usdAmount || usdAmount <= 0) return 0;
    return usdAmount * exchangeRate;
  };

  // Convertir Bs a USD
  const toDollars = (bsAmount) => {
    if (!isRateAvailable || !bsAmount || exchangeRate === 0) return 0;
    return bsAmount / exchangeRate;
  };

  // Formatear moneda
  const formatCurrency = (amount, currency = 'USD', locale = null) => {
    if (!amount && amount !== 0) return currency === 'USD' ? '$0.00' : 'Bs 0.00';
    
    const locales = {
      'USD': 'en-US',
      'VES': 'es-VE'
    };
    
    const currencyCode = currency === 'USD' ? 'USD' : 'VES';
    const localeCode = locale || locales[currencyCode] || 'en-US';

    try {
      return new Intl.NumberFormat(localeCode, {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    } catch {
      // Fallback
      const symbol = currency === 'USD' ? '$' : 'Bs ';
      return `${symbol}${amount.toFixed(2)}`;
    }
  };

  // Obtener display completo de un precio
  const getPriceDisplay = (usdAmount) => {
    if (!usdAmount && usdAmount !== 0) {
      return {
        usd: formatCurrency(0, 'USD'),
        bs: formatCurrency(0, 'VES'),
        exchangeRate,
        usdAmount: 0,
        bsAmount: 0,
        isRateAvailable
      };
    }

    const bsAmount = toBolivares(usdAmount);
    return {
      usd: formatCurrency(usdAmount, 'USD'),
      bs: isRateAvailable ? formatCurrency(bsAmount, 'VES') : 'Tasa no configurada',
      exchangeRate,
      usdAmount,
      bsAmount,
      isRateAvailable
    };
  };

  return {
    exchangeRate,
    toBolivares,
    toDollars,
    formatCurrency,
    getPriceDisplay,
    isRateAvailable
  };
};