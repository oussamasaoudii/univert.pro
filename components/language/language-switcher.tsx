"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useSiteLanguage } from "@/hooks/use-site-language";
import {
  persistLanguageClient,
  SUPPORTED_LANGUAGES,
  LANGUAGE_CONFIG,
  type SiteLanguage,
} from "@/lib/i18n/language";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
  withTheme?: boolean;
}

export function LanguageSwitcher({ className, withTheme = false }: LanguageSwitcherProps) {
  const router = useRouter();
  const language = useSiteLanguage();
  const [open, setOpen] = useState(false);

  const currentLang = LANGUAGE_CONFIG[language];

  const handleLanguageChange = (nextLanguage: SiteLanguage) => {
    if (nextLanguage === language) {
      setOpen(false);
      return;
    }

    persistLanguageClient(nextLanguage);
    setOpen(false);
    router.refresh();
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-border bg-background/80 p-1 backdrop-blur",
        className,
      )}
      role="group"
      aria-label="Language switcher"
    >
      {withTheme ? (
        <>
          <ThemeToggle
            iconOnly
            variant="ghost"
            className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
          />
          <span className="mx-1 h-4 w-px bg-border/80" aria-hidden />
        </>
      ) : null}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Globe className="h-3.5 w-3.5" />
            <span className="text-base leading-none" aria-hidden="true">{currentLang.flag}</span>
            <span className="font-medium">{language.toUpperCase()}</span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-auto p-2" 
          align="end"
          sideOffset={8}
        >
          <div className="grid grid-cols-2 gap-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const config = LANGUAGE_CONFIG[lang];
              const isActive = language === lang;
              
              return (
                <Button
                  key={lang}
                  type="button"
                  size="sm"
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "h-9 justify-start gap-2 px-3 text-sm",
                    isActive && "bg-primary/10 text-primary font-medium",
                  )}
                  onClick={() => handleLanguageChange(lang)}
                >
                  <span className="text-base leading-none" aria-hidden="true">{config.flag}</span>
                  <span>{config.nativeName}</span>
                </Button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
