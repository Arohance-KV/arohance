import { applyTheme } from './theme';
import { reveal } from './reveal';
import { parallax } from './parallax';
import { nav } from './nav';
import { shell } from './shell';
import { clock } from './clock';
import { form } from './form';
import type { Behavior } from './types';

export * from './types';
export { applyTheme, reveal, parallax, nav, shell, clock, form };

/** Behaviours every page mounts, in the original componentDidMount order. */
export const SHARED: Behavior[] = [applyTheme, reveal, parallax, nav, shell, clock, form];
