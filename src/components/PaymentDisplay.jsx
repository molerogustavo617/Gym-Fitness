// src/components/PaymentDisplay.jsx
import React from 'react';
import { usePriceConverter } from '../hooks/usePriceConverter';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

const PaymentDisplay = ({ 
  amountUSD, 
  title = 'Monto a Pagar', 
  showBoth = true,
  className = '',
  showExchangeRate = true
}) => {
  const { getPriceDisplay, isRateAvailable, exchangeRate } = usePriceConverter();
  const prices = getPriceDisplay(amountUSD);

  // Si no hay monto, mostrar mensaje
  if (!amountUSD && amountUSD !== 0) {
    return (
      <div className={`bg-gym-dark-secondary rounded-xl border border-gym-gray/10 p-4 ${className}`}>
        <p className="text-gym-gray-light text-sm">No hay monto disponible</p>
      </div>
    );
  }

  // Si la tasa no está disponible, mostrar solo USD
  if (!isRateAvailable) {
    return (
      <div className={`bg-gym-dark-secondary rounded-xl border border-gym-gray/10 p-4 ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-4 h-4 text-gym-neon" />
          <h4 className="text-sm font-semibold text-gym-gray-light uppercase tracking-wider">
            {title}
          </h4>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gym-gray-light">💵 En USD</span>
          <span className="text-lg font-bold text-gym-white">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD'
            }).format(amountUSD || 0)}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2">
          <AlertCircle className="w-4 h-4 text-yellow-400" />
          <span className="text-xs text-yellow-400">Tasa de cambio no configurada</span>
        </div>
      </div>
    );
  }

  // ✅ Formatear con separador de miles y decimales para Venezuela
  const formatBs = (amount) => {
    if (!amount && amount !== 0) return 'Bs 0,00';
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const pricesBs = formatBs(prices.bsAmount);

  return (
    <div className={`bg-gym-dark-secondary rounded-xl border border-gym-gray/10 p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="w-4 h-4 text-gym-neon" />
        <h4 className="text-sm font-semibold text-gym-gray-light uppercase tracking-wider">
          {title}
        </h4>
      </div>

      <div className="space-y-2">
        {/* Monto en USD */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gym-gray-light"> En USD</span>
          <span className="text-lg font-bold text-gym-white">{prices.usd}</span>
        </div>

        {/* Monto en Bs con formato venezolano */}
        {showBoth && isRateAvailable && (
          <div className="flex justify-between items-center border-t border-gym-gray/10 pt-2">
            <span className="text-sm text-gym-gray-light">
              🇻🇪 En Bs
              {showExchangeRate && (
                <span className="text-xs text-gym-gray-light ml-1">
                  (Tasa: {exchangeRate?.toFixed(2)})
                </span>
              )}
            </span>
            <span className="text-lg font-bold text-green-400">{pricesBs}</span>
          </div>
        )}

        {/* Información para Pago Móvil */}
        {isRateAvailable && amountUSD > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 mt-2">
            <p className="text-xs text-blue-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>
                Pago Móvil: <strong>{pricesBs}</strong>
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentDisplay;