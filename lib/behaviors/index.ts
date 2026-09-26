import { applyTheme } from './theme';
import { reveal } from './reveal';
import { parallax } from './parallax';
import { nav } from './nav';
import { shell } from './shell';
import { clock } from './clock';
import { form } from './form';
import { services } from './services';
import { hovers } from './hovers';
import { cursor } from './cursor';
import { flags } from './flags';
import { video } from './video';
import { ether } from './ether';
import { magnet } from './magnet';
import { stroke } from './stroke';
import { reel } from './reel';
import { trail } from './trail';
import { roles } from './roles';
import { navCareers } from './navCareers';
import type { Behavior } from './types';

export * from './types';
export { applyTheme, reveal, parallax, nav, shell, clock, form };
export { services, hovers, cursor, flags, video, ether, magnet, stroke, reel, trail };
export { roles, navCareers };

/** Behaviours every page mounts, in the original componentDidMount order. */
export const SHARED: Behavior[] = [applyTheme, reveal, parallax, nav, shell, clock, form];
