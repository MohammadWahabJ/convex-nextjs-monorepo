"use client";

import * as React from "react";
import { Globe, Check } from "lucide-react";
import { usePathname } from 'next/navigation'

import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";

const languages = [
  {
    code: "en",
    name: "English",
    flag: "🇺🇸",
  },
  {
    code: "de",
    name: "Deutsch",
    flag: "🇩🇪",
  },
] as const;

interface LanguageSwitcherProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg";
  showFlag?: boolean;
  showText?: boolean;
}

export function LanguageSwitcher({
  variant = "outline",
  size = "icon",
  showFlag = true,
  showText = false,
}: LanguageSwitcherProps) {
  const pathname = usePathname();
  
  // Extract locale from pathname (e.g., /en/dashboard -> en)
  const locale = React.useMemo(() => {
    const segments = pathname.split("/");
    const localeSegment = segments[1];
    return languages.find((lang) => lang.code === localeSegment)?.code || "en";
  }, [pathname]);

  const currentLanguage =
    languages.find((lang) => lang.code === locale) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    // Store the language preference in localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred-language", languageCode);

      // Navigate to the new locale by replacing the current locale in the URL
      const currentPath = window.location.pathname;
      const segments = currentPath.split("/");
      segments[1] = languageCode; // Replace the locale segment
      const newPath = segments.join("/");

      window.location.href = newPath;
    }
  };

  const buttonContent = React.useMemo(() => {
    const components = [];

    if (showFlag && currentLanguage.flag) {
      components.push(
        <span key="flag" className="text-sm">
          {currentLanguage.flag}
        </span>
      );
    }

    if (!showFlag && !showText) {
      components.push(<Globe key="globe" className="h-[1.2rem] w-[1.2rem]" />);
    }

    if (showText) {
      components.push(
        <span key="text" className="ml-2">
          {currentLanguage.name}
        </span>
      );
    }

    return components;
  }, [showFlag, showText, currentLanguage]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} className="h-7 w-5">
          {buttonContent}
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <span className="mr-2">{language.flag}</span>
              <span>{language.name}</span>
            </div>
            {locale === language.code && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Enhanced version with more customization options
export function LanguageSwitcherText({
  variant = "ghost",
  showCurrentOnly = false,
}: {
  variant?: "default" | "outline" | "ghost";
  showCurrentOnly?: boolean;
}) {
  const pathname = usePathname();
  
  // Extract locale from pathname (e.g., /en/dashboard -> en)
  const locale = React.useMemo(() => {
    const segments = pathname.split("/");
    const localeSegment = segments[1];
    return languages.find((lang) => lang.code === localeSegment)?.code || "en";
  }, [pathname]);

  const currentLanguage =
    languages.find((lang) => lang.code === locale) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("preferred-language", languageCode);

      const currentPath = window.location.pathname;
      const segments = currentPath.split("/");
      segments[1] = languageCode;
      const newPath = segments.join("/");

      window.location.href = newPath;
    }
  };

  if (showCurrentOnly) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Globe className="h-4 w-4" />
        <span>
          {currentLanguage.flag} {currentLanguage.name}
        </span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} className="h-auto p-2">
          <Globe className="h-4 w-4 mr-2" />
          <span>
            {currentLanguage.flag} {currentLanguage.name}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <span className="mr-2">{language.flag}</span>
              <span>{language.name}</span>
            </div>
            {locale === language.code && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
