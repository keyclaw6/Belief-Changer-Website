// Track C R2: pure environment-plate selection (no DOM, unit-testable).
//
// The plates are immutable generated input under site/public/orbit/env/:
// separately authored desktop day, desktop night, mobile day, mobile night.
// (The night-mobile plate arrived before finalization, so no day-for-night
// fallback is used anywhere; no CSS dim of any plate exists.)

export const ENV_ASSETS = {
  dayDesktop: './env/c-r2-day-candidate-1.png',
  dayMobile: './env/c-r2-day-mobile.png',
  nightDesktop: './env/c-r2-night-desktop.png',
  nightMobile: './env/c-r2-night-mobile.png',
};

/** False: a genuine night-mobile plate exists and is used for mobile dark. */
export const ENV_NIGHT_MOBILE_PENDING = false;

export function selectEnvAsset({ mobile = false, dark = false } = {}) {
  if (mobile) return dark ? ENV_ASSETS.nightMobile : ENV_ASSETS.dayMobile;
  return dark ? ENV_ASSETS.nightDesktop : ENV_ASSETS.dayDesktop;
}

/** R2 default: the authored environment is on; ?env=0 is the explicit
 *  baseline/diagnostic (zero env bytes, atmosphere pass, studio lighting). */
export function envDefaultEnabled(search = '') {
  try {
    return new URLSearchParams(search).get('env') !== '0';
  } catch {
    return true;
  }
}
