import type { Behavior } from './types';

export const applyTheme: Behavior = () => {
  document.documentElement.style.setProperty('--ag-accent', '#F2600C');
  return () => {};
};
