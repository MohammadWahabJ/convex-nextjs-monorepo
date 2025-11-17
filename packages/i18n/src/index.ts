import {routing} from './routing';

export type Locale = (typeof routing.locales)[number];

export * from 'next-intl';
export {routing} from './routing';
export * from './navigation';
export * from './server';