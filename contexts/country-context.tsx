"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import Cookies from "js-cookie";
import type { Country } from "@/lib/countries/types";

const COUNTRY_COOKIE_NAME = "univert_country";
const COUNTRY_COOKIE_EXPIRY = 365; // days

interface CountryContextValue {
  country: Country | null;
  countries: Country[];
  isLoading: boolean;
  setCountry: (country: Country) => void;
  formatPrice: (amount: number, options?: { showSymbol?: boolean }) => string;
}

const CountryContext = createContext<CountryContextValue | null>(null);

interface CountryProviderProps {
  children: ReactNode;
  initialCountry?: Country | null;
  initialCountries?: Country[];
}

export function CountryProvider({
  children,
  initialCountry = null,
  initialCountries = [],
}: CountryProviderProps) {
  const [country, setCountryState] = useState<Country | null>(initialCountry);
  const [countries, setCountries] = useState<Country[]>(initialCountries);
  const [isLoading, setIsLoading] = useState(!initialCountry);

  // Fetch countries on mount if not provided
  useEffect(() => {
    if (initialCountries.length === 0) {
      fetch("/api/countries")
        .then((res) => res.json())
        .then((data) => {
          if (data.countries) {
            setCountries(data.countries);
          }
        })
        .catch(console.error);
    }
  }, [initialCountries.length]);

  // Load country from cookie on mount
  useEffect(() => {
    if (initialCountry) {
      setIsLoading(false);
      return;
    }

    const savedSlug = Cookies.get(COUNTRY_COOKIE_NAME);
    if (savedSlug && countries.length > 0) {
      const savedCountry = countries.find((c) => c.slug === savedSlug);
      if (savedCountry) {
        setCountryState(savedCountry);
        setIsLoading(false);
        return;
      }
    }

    // Use default country
    const defaultCountry = countries.find((c) => c.isDefault) || countries[0];
    if (defaultCountry) {
      setCountryState(defaultCountry);
    }
    setIsLoading(false);
  }, [initialCountry, countries]);

  const setCountry = useCallback((newCountry: Country) => {
    setCountryState(newCountry);
    Cookies.set(COUNTRY_COOKIE_NAME, newCountry.slug, {
      expires: COUNTRY_COOKIE_EXPIRY,
      sameSite: "lax",
    });
  }, []);

  const formatPrice = useCallback(
    (amount: number, options?: { showSymbol?: boolean }) => {
      const showSymbol = options?.showSymbol !== false;
      
      if (!country) {
        return showSymbol ? `$${amount.toFixed(2)}` : amount.toFixed(2);
      }

      try {
        const formatter = new Intl.NumberFormat(country.locale, {
          style: showSymbol ? "currency" : "decimal",
          currency: showSymbol ? country.currencyCode : undefined,
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
        return formatter.format(amount);
      } catch {
        // Fallback for unsupported locales
        const formatted = amount.toFixed(2);
        return showSymbol ? `${country.currencySymbol}${formatted}` : formatted;
      }
    },
    [country]
  );

  return (
    <CountryContext.Provider
      value={{
        country,
        countries,
        isLoading,
        setCountry,
        formatPrice,
      }}
    >
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry() {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error("useCountry must be used within a CountryProvider");
  }
  return context;
}

export function useCountryOptional() {
  return useContext(CountryContext);
}
