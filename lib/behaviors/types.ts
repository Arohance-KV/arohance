export type Behavior = (root: HTMLElement) => () => void;

/** The frozen "Expressive" motion profile from the original artifact props. */
export const MOTION = { y: 46, dur: 1100, amp: 96 } as const;
