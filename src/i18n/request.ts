import { getRequestConfig } from 'next-intl/server';
import en from './en/common.json';
import am from './am/common.json';

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = locale || 'en';
  return {
    locale: resolvedLocale,
    messages: resolvedLocale === 'am' ? am : en,
  };
});
