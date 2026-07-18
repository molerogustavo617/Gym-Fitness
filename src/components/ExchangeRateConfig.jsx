// src/components/ExchangeRateConfig.jsx
import React, { useState, useEffect } from 'react';
import { useExchangeRate } from '../context/ExchangeRateContext';
import { DollarSign, RefreshCw, Save, X, Edit3, AlertCircle } from 'lucide-react';
import authService from '../services/authService';

const ExchangeRateConfig = () => {
  const { exchangeRate, lastUpdated, updateExchangeRate, loading, refreshExchangeRate, error } = useExchangeRate();
  const [rate, setRate] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    if (exchangeRate) {
      setRate(exchangeRate.toString());
    }
  }, [exchangeRate]);

  // ✅ Cargar la tasa al montar el componente (solo si es admin)
  useEffect(() => {
    if (user && user.idrol === 1) {
      refreshExchangeRate();
    }
  }, [user]);

  // Solo visible para administradores
  if (!user || user.idrol !== 1) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateExchangeRate(rate);
      setIsEditing(false);
    } catch (error) {
      // El error ya se maneja en el contexto
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-VE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <div className="bg-gym-dark-secondary rounded-2xl border border-gym-gray/10 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-gym-neon" />
          <h3 className="text-sm font-semibold text-gym-gray-light uppercase tracking-wider">
            Tasa de Cambio
          </h3>
        </div>
        <button
          onClick={refreshExchangeRate}
          disabled={loading}
          className="text-gym-gray-light hover:text-gym-white transition-colors p-1 rounded hover:bg-gym-card/30"
          title="Actualizar"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-400" />
          <span className="text-xs text-yellow-400">{error}</span>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-gym-gray-light text-xs block mb-1">
              1 USD = ? Bs
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="flex-1 px-3 py-2 bg-gym-dark rounded-lg border border-gym-gray/20 text-gym-white text-sm focus:outline-none focus:border-gym-neon/50 transition-colors"
                placeholder="Ej: 40.50"
                disabled={loading}
                autoFocus
              />
              <button
                type="submit"
                disabled={loading}
                className="px-3 py-2 bg-gym-neon text-gym-dark rounded-lg text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-gym-dark border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRate(exchangeRate.toString());
                  setIsEditing(false);
                }}
                className="px-3 py-2 bg-gym-dark border border-gym-gray/20 text-gym-gray-light rounded-lg hover:bg-gym-card transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gym-gray-light mt-1">
              Última actualización: {formatDate(lastUpdated)}
            </p>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div className="bg-gym-dark rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-gym-neon">
              Bs {exchangeRate?.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-gym-gray-light mt-1">
              1 USD = Bs {exchangeRate?.toFixed(2) || '0.00'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gym-dark rounded-lg p-2 text-center">
              <p className="text-gym-gray-light">$10 USD</p>
              <p className="text-gym-white font-semibold">
                Bs {exchangeRate ? (exchangeRate * 10).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="bg-gym-dark rounded-lg p-2 text-center">
              <p className="text-gym-gray-light">$50 USD</p>
              <p className="text-gym-white font-semibold">
                Bs {exchangeRate ? (exchangeRate * 50).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="w-full px-4 py-2 bg-gym-neon/10 text-gym-neon border border-gym-neon/20 rounded-lg text-sm font-medium hover:bg-gym-neon/20 transition-colors flex items-center justify-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Editar Tasa
          </button>
        </div>
      )}
    </div>
  );
};

export default ExchangeRateConfig;