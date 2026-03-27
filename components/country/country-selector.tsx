"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown, Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCountry } from "@/contexts/country-context";
import { cn } from "@/lib/utils";
import type { Country } from "@/lib/countries/types";

interface CountrySelectorProps {
  variant?: "default" | "compact" | "minimal";
  showFlag?: boolean;
  showCurrency?: boolean;
  className?: string;
  onCountryChange?: (country: Country) => void;
}

export function CountrySelector({
  variant = "default",
  showFlag = true,
  showCurrency = false,
  className,
  onCountryChange,
}: CountrySelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { country, countries, setCountry, isLoading } = useCountry();
  const [open, setOpen] = useState(false);

  const handleSelect = (selected: Country) => {
    setCountry(selected);
    setOpen(false);

    // If we're on a country-specific route, redirect to the new country's route
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0) {
      const currentSlug = segments[0];
      const isCountryRoute = countries.some((c) => c.slug === currentSlug);
      
      if (isCountryRoute) {
        const newPath = `/${selected.slug}/${segments.slice(1).join("/")}`;
        router.push(newPath);
      }
    }

    onCountryChange?.(selected);
  };

  if (isLoading || !country) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn("animate-pulse", className)}
        disabled
      >
        <Globe className="h-4 w-4" />
      </Button>
    );
  }

  const renderTriggerContent = () => {
    if (variant === "minimal") {
      return (
        <>
          <Globe className="h-4 w-4" />
          <span className="sr-only">Select country</span>
        </>
      );
    }

    if (variant === "compact") {
      return (
        <>
          {showFlag && country.flagEmoji && (
            <span className="text-base">{country.flagEmoji}</span>
          )}
          <span className="uppercase font-medium">{country.isoCode}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </>
      );
    }

    return (
      <>
        {showFlag && country.flagEmoji && (
          <span className="text-lg">{country.flagEmoji}</span>
        )}
        <span className="font-medium">{country.name}</span>
        {showCurrency && (
          <span className="text-muted-foreground text-xs">
            ({country.currencyCode})
          </span>
        )}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </>
    );
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={variant === "compact" ? "sm" : "default"}
          className={cn(
            "gap-2",
            variant === "minimal" && "w-9 p-0",
            className
          )}
        >
          {renderTriggerContent()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 max-h-80 overflow-y-auto"
      >
        {countries.map((item) => (
          <DropdownMenuItem
            key={item.id}
            onClick={() => handleSelect(item)}
            className={cn(
              "flex items-center justify-between gap-3 cursor-pointer",
              item.textDirection === "rtl" && "flex-row-reverse text-right"
            )}
          >
            <div className="flex items-center gap-2">
              {showFlag && item.flagEmoji && (
                <span className="text-lg">{item.flagEmoji}</span>
              )}
              <div className="flex flex-col">
                <span className="font-medium">{item.name}</span>
                {item.nameNative && item.nameNative !== item.name && (
                  <span className="text-xs text-muted-foreground">
                    {item.nameNative}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {item.currencyCode}
              </span>
              {item.id === country.id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function CountrySelectorInline({
  className,
  onCountryChange,
}: {
  className?: string;
  onCountryChange?: (country: Country) => void;
}) {
  const { country, countries, setCountry } = useCountry();

  if (!country) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {countries.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            setCountry(item);
            onCountryChange?.(item);
          }}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors",
            item.id === country.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80 text-muted-foreground"
          )}
        >
          {item.flagEmoji && <span>{item.flagEmoji}</span>}
          <span>{item.isoCode}</span>
        </button>
      ))}
    </div>
  );
}
