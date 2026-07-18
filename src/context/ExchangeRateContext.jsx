// src/context/ExchangeRateContext.jsx
import React, { createContext, useContext, useState } from 'react';
import configuracionService from '../services/configuracionService';

const ExchangeRateContext = createContext();

export const useExchangeRate = () => {
  const context = useContext(ExchangeRateContext);
  if (!context) {
    throw new Error('useExchangeRate must be used within ExchangeRateProvider');
  }
  return context;
};

export const ExchangeRateProvider = ({ children }) => {
  // Estado inicial desde localStorage para evitar llamadas innecesarias
  const [exchangeRate, setExchangeRate] = useState(() => {
    const saved = localStorage.getItem('gym_exchange_rate');
    return saved ? parseFloat(saved) : 0;
  });
  
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(() => {
    return localStorage.getItem('gym_exchange_rate_last_updated') || null;
  });

  // Función para cargar la tasa - se llama MANUALMENTE cuando se necesita
  const loadExchangeRate = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      const rate = await configuracionService.getExchangeRate();
      const finalRate = rate || 0;
      
      setExchangeRate(finalRate);
      const now = new Date().toISOString();
      setLastUpdated(now);
      
      localStorage.setItem('gym_exchange_rate', finalRate.toString());
      localStorage.setItem('gym_exchange_rate_last_updated', now);
      
      return finalRate;
    } catch (err) {
      console.error('Error al cargar tasa:', err);
      return exchangeRate;
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar la tasa
  const updateExchangeRate = async (newRate) => {
    try {
      setLoading(true);
      const rate = parseFloat(newRate);
      if (isNaN(rate) || rate < 0) {
        throw new Error('Ingresa un valor válido');
      }
      
      const result = await configuracionService.updateExchangeRate(rate);
      const finalRate = result.tasaCambio || rate;
      
      setExchangeRate(finalRate);
      const now = new Date().toISOString();
      setLastUpdated(now);
      
      localStorage.setItem('gym_exchange_rate', finalRate.toString());
      localStorage.setItem('gym_exchange_rate_last_updated', now);
      
      alert('✅ Tasa de cambio actualizada');
      return result;
    } catch (err) {
      alert('❌ ' + (err.message || 'Error al actualizar'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    exchangeRate,
    loading,
    lastUpdated,
    updateExchangeRate,
    refreshExchangeRate: loadExchangeRate,
    isRateAvailable: exchangeRate > 0
  };

  return (
    <ExchangeRateContext.Provider value={value}>
      {children}
    </ExchangeRateContext.Provider>
  );
};