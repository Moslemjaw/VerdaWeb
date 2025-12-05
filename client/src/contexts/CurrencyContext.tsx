import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';

interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

interface ExchangeRates {
  [key: string]: number;
}

interface CurrencyContextType {
  currency: CurrencyInfo;
  setCurrency: (code: string) => void;
  formatPrice: (priceInKWD: number) => string;
  rates: ExchangeRates;
  isLoading: boolean;
  availableCurrencies: CurrencyInfo[];
}

const CURRENCIES: CurrencyInfo[] = [
  { code: 'KWD', symbol: 'KWD', name: 'Kuwaiti Dinar' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  { code: 'QAR', symbol: 'QAR', name: 'Qatari Riyal' },
  { code: 'BHD', symbol: 'BHD', name: 'Bahraini Dinar' },
  { code: 'OMR', symbol: 'OMR', name: 'Omani Rial' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

const COUNTRY_TO_CURRENCY: { [key: string]: string } = {
  KW: 'KWD',
  SA: 'SAR',
  AE: 'AED',
  QA: 'QAR',
  BH: 'BHD',
  OM: 'OMR',
  US: 'USD',
  GB: 'GBP',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  IE: 'EUR',
  PT: 'EUR',
  GR: 'EUR',
};

const DEFAULT_RATES: ExchangeRates = {
  KWD: 1,
  SAR: 12.19,
  AED: 11.95,
  QAR: 11.85,
  BHD: 1.23,
  OMR: 1.25,
  USD: 3.26,
  EUR: 3.09,
  GBP: 2.59,
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencyCode, setCurrencyCode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('preferredCurrency') || 'KWD';
    }
    return 'KWD';
  });

  const { data: ratesData, isLoading: ratesLoading } = useQuery({
    queryKey: ['exchangeRates'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/currency/rates');
        if (!res.ok) throw new Error('Failed to fetch rates');
        return await res.json();
      } catch {
        return { rates: DEFAULT_RATES };
      }
    },
    staleTime: 1000 * 60 * 60,
    refetchInterval: 1000 * 60 * 60,
  });

  const { data: geoData } = useQuery({
    queryKey: ['userLocation'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/currency/detect');
        if (!res.ok) throw new Error('Failed to detect location');
        return await res.json();
      } catch {
        return { currency: 'KWD', country: 'KW' };
      }
    },
    staleTime: Infinity,
    enabled: !localStorage.getItem('preferredCurrency'),
  });

  useEffect(() => {
    if (geoData?.currency && !localStorage.getItem('preferredCurrency')) {
      const detectedCurrency = CURRENCIES.find(c => c.code === geoData.currency);
      if (detectedCurrency) {
        setCurrencyCode(geoData.currency);
      }
    }
  }, [geoData]);

  const rates = ratesData?.rates || DEFAULT_RATES;

  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0];

  const setCurrency = (code: string) => {
    const newCurrency = CURRENCIES.find(c => c.code === code);
    if (newCurrency) {
      setCurrencyCode(code);
      localStorage.setItem('preferredCurrency', code);
    }
  };

  const formatPrice = (priceInKWD: number): string => {
    if (!priceInKWD && priceInKWD !== 0) return '';
    
    const rate = rates[currency.code] || 1;
    const convertedPrice = priceInKWD * rate;
    
    const formatted = convertedPrice.toFixed(currency.code === 'KWD' || currency.code === 'BHD' || currency.code === 'OMR' ? 3 : 2);
    
    if (currency.code === 'USD' || currency.code === 'EUR' || currency.code === 'GBP') {
      return `${currency.symbol}${formatted}`;
    }
    return `${formatted} ${currency.code}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        rates,
        isLoading: ratesLoading,
        availableCurrencies: CURRENCIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
