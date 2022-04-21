import { useMemo } from "react";
import { useRouteMatch } from "react-router-dom";

import {
  transformAddressToAddressAlias,
  transformAddressAliasToAddress,
} from "../constants/addressAliases";
import {
  DEFAULT_LOCALE,
  getUserLanguage,
  SUPPORTED_LOCALES,
  SupportedLocale,
} from "../constants/locales";
import { AppRoutes, SwapRoutes } from "../routes";

export interface AppRouteParams {
  lang: SupportedLocale;
  route?: AppRoutes;
  tokenFrom?: string;
  tokenTo?: string;
  tokenFromAlias?: string;
  tokenToAlias?: string;
  /**
   * Url from useRouteMatch
   */
  url: string;
  /**
   * Url without language, ie: /swap/0x1234/0x5678, or /join or empty string
   */
  urlWithoutLang: string;
  /**
   * Base url with optional languge, ie: /join or /fr/swap or empty string
   */
  justifiedBaseUrl: string;
}

function transformStringToSupportedLanguage(
  value: string
): SupportedLocale | undefined {
  const locale = value as SupportedLocale;
  if (SUPPORTED_LOCALES.includes(locale)) {
    return locale;
  }

  return undefined;
}

const useAppRouteParams = (): AppRouteParams => {
  const routeMatch = useRouteMatch<{ routeOrLang?: string }>(`/:routeOrLang`);

  const routeWithLangMatch = useRouteMatch<{
    lang: SupportedLocale;
    route?: AppRoutes;
  }>(`/:lang/:route`);

  const swapMatch = useRouteMatch<{
    route?: AppRoutes.swap;
    tokenFrom?: string;
    tokenTo?: string;
  }>(`/:route/:${SwapRoutes.tokenFrom}/:${SwapRoutes.tokenTo}`);

  const swapWithLangMatch = useRouteMatch<{
    lang: SupportedLocale;
    route?: AppRoutes.swap;
    tokenFrom?: string;
    tokenTo?: string;
  }>(`/:lang/:route/:${SwapRoutes.tokenFrom}/:${SwapRoutes.tokenTo}`);

  const userLanguage = useMemo(() => getUserLanguage(), []);

  const swapWithLangMatchData = useMemo(() => {
    if (swapWithLangMatch) {
      const lang =
        transformStringToSupportedLanguage(swapWithLangMatch.params.lang) ||
        DEFAULT_LOCALE;
      const tokenFrom = transformAddressAliasToAddress(
        swapWithLangMatch.params.tokenFrom
      );
      const tokenTo = transformAddressAliasToAddress(
        swapWithLangMatch.params.tokenTo
      );
      const tokenFromAlias = transformAddressToAddressAlias(tokenFrom);
      const tokenToAlias = transformAddressToAddressAlias(tokenTo);

      return {
        lang,
        tokenFrom,
        tokenTo,
        tokenFromAlias,
        tokenToAlias,
        route: AppRoutes.swap,
        url: swapWithLangMatch.url,
        urlWithoutLang: `/${AppRoutes.swap}/${tokenFromAlias}/${tokenToAlias}/`,
        justifiedBaseUrl: `/${lang}`,
      };
    }
  }, [swapWithLangMatch]);

  const swapMatchData = useMemo(() => {
    if (swapMatch) {
      const tokenFrom = transformAddressAliasToAddress(
        swapMatch.params.tokenFrom
      );
      const tokenTo = transformAddressAliasToAddress(swapMatch.params.tokenTo);
      const tokenFromAlias = transformAddressToAddressAlias(tokenFrom);
      const tokenToAlias = transformAddressToAddressAlias(tokenTo);

      return {
        tokenFrom,
        tokenTo,
        readableTokenFrom: tokenFromAlias,
        readableTokenTo: tokenToAlias,
        route: swapMatch.params.route,
        lang: userLanguage,
        url: swapMatch.url,
        urlWithoutLang: `/${AppRoutes.swap}/${tokenFromAlias}/${tokenToAlias}/`,
        justifiedBaseUrl: "",
      };
    }
  }, [swapMatch, userLanguage]);

  const routeWithLangMatchData = useMemo(() => {
    if (routeWithLangMatch) {
      const lang =
        transformStringToSupportedLanguage(routeWithLangMatch.params.lang) ||
        DEFAULT_LOCALE;

      return {
        lang,
        route: routeWithLangMatch.params.route,
        url: routeWithLangMatch.url,
        urlWithoutLang: `/${routeWithLangMatch.params.route}`,
        justifiedBaseUrl: `/${lang}`,
      };
    }
  }, [routeWithLangMatch]);

  const routeMatchData = useMemo(() => {
    if (routeMatch) {
      const { routeOrLang } = routeMatch.params;
      const lang = transformStringToSupportedLanguage(routeOrLang as string);

      return {
        route: lang ? undefined : (routeMatch.params.routeOrLang as AppRoutes),
        lang: lang || DEFAULT_LOCALE,
        url: routeMatch.url,
        urlWithoutLang: lang ? "" : routeMatch.url,
        justifiedBaseUrl: lang ? `/${lang}` : "",
      };
    }
  }, [routeMatch]);

  if (swapWithLangMatchData) {
    return swapWithLangMatchData;
  }

  if (swapMatchData) {
    return swapMatchData;
  }

  if (routeWithLangMatchData) {
    return routeWithLangMatchData;
  }

  if (routeMatchData) {
    return routeMatchData;
  }

  return {
    lang: userLanguage,
    url: "",
    urlWithoutLang: "",
    justifiedBaseUrl: "",
  };
};

export default useAppRouteParams;
