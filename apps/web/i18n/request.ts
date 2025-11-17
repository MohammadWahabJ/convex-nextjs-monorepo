import {getRequestConfig} from '@workspace/i18n/server';
import {hasLocale} from '@workspace/i18n';
import {routing} from '@workspace/i18n/routing';

export default getRequestConfig(async function createRequestConfig({
  requestLocale,
}) {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../../packages/i18n/src/messages/${locale}.json`)).default,
  };
});
