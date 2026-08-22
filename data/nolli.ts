import type { ImageSourcePropType } from 'react-native';

/**
 * The Nolli figure-ground plan of Tel Aviv shown in the Field research band.
 *
 * Metro needs a static `require()`, so the image cannot be resolved from a path
 * at runtime. To swap it, replace the file and keep the name.
 */
export const nolliSource: ImageSourcePropType | null = require('../assets/images/nolli-tel-aviv.jpg');

/**
 * How large the plan is drawn, in points. Much bigger than the 210pt band in
 * both directions — the surplus is the room the camera has to travel through
 * without ever exposing an edge. The 1.79 ratio matches the source, so nothing
 * is distorted.
 */
export const NOLLI_PLAN_WIDTH = 1100;
export const NOLLI_PLAN_HEIGHT = 614;

/** One full cycle of the drift path, in seconds. */
export const NOLLI_PERIOD_SECONDS = 120;

/**
 * Fraction of the available travel actually used. Held below 1 so the plan's
 * edges stay outside the band at every point on the path.
 */
export const NOLLI_TRAVEL = 0.9;

/**
 * The drift is an **epicycle** — a large circle with a smaller one riding on
 * it, both turning the same way:
 *
 *   u = A·cos(θ) + B·cos(kθ + φ)
 *   v = A·sin(θ) + B·sin(kθ + φ)
 *
 * Chosen over a sum of sines because it cannot stall. Each term contributes a
 * velocity vector of constant magnitude — A and B·k — so the combined speed
 * stays between |A − B·k| and A + B·k. With A comfortably greater than B·k the
 * lower bound is strictly positive, meaning the plan never pauses to turn
 * around; it simply keeps travelling, faster on the outside of each swing.
 *
 * `k` is a whole number, so the path closes exactly once per period.
 */
export const NOLLI_EPI = { A: 0.72, B: 0.14, k: 3, phase: 0.9 };
