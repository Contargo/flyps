/**
 * An effector is the place where all the dirty stuff happens. By providing an
 * effect's identifier the registered effect handler gets called and must do
 * the required mutations of the world. This can be anything, e.g. reset a
 * `signal`'s state, `trigger` events, change the browser's state (e.g.
 * updating the scrollbar position) or doing XHRs, to name just a few examples.
 *
 * @module effect
 */

/** Holds the registered effectors. */
let registry = new Map();

/**
 * Registers an effect handler identified by `effectId`.
 *
 * @param {string} effectId An effect identifier.
 * @param {function} handlerFn A function which gets passed the arguments from
 *    the call to `effect`.
 */
export function effector(effectId, handlerFn) {
  if (registry.has(effectId)) {
    console.warn("overwriting effector for", effectId);
  }
  registry.set(effectId, handlerFn);
}

/**
 * Calls the effect handler identified by `effectId` with the provided `args`.
 *
 * Note: for any given call to `effect` there must be a previous call to
 * `effector`, registering a handler function for `effectId`.
 *
 * @param {string} effectId The effect identifier.
 * @param  {...any} args Arguments passed to the effect handler.
 */
export function effect(effectId, ...args) {
  let handlerFn = registry.get(effectId);
  if (handlerFn) {
    handlerFn(...args);
    return;
  }
  console.warn("no effector registered for", effectId);
}

/**
 * Clears all registered effectors.
 */
export function clearEffectors() {
  registry.clear();
}
