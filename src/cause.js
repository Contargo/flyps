/**
 * Unlike an effect, a cause does not mutate but extracts state from the world.
 * By providing a cause identifier the registered cause handler gets called and
 * must return the requested state. A cause can be anything, e.g. the current
 * state of a `signal`, the current time or a browsers window dimensions, just
 * to give some examples.
 *
 * @module cause
 */

/** Holds the registered causings. */
let registry = new Map();

/**
 * Registers a cause handler identified by `causeId`.
 *
 * @param {string} causeId A cause identifier.
 * @param {function} handlerFn A function which gets passed the arguments from
 *    the call to `cause`.
 */
export function causing(causeId, handlerFn) {
  if (registry.has(causeId)) {
    console.warn("overwriting causing for", causeId);
  }
  registry.set(causeId, handlerFn);
}

/**
 * Calls the cause handler identified by `causeId` with the provided `args`.
 *
 * Note: for any given call to `cause` there must be a previous call to
 * `causing`, registering a handler function for `causeId`.
 *
 * @param {string} causeId The cause identifier.
 * @param  {...any} args Arguments passed to the cause handler.
 */
export function cause(causeId, ...args) {
  let handlerFn = registry.get(causeId);
  if (handlerFn) {
    return handlerFn(...args);
  }
  console.warn("no causing registered for:", causeId);
}

/**
 * Clears all registered causings.
 */
export function clearCausings() {
  registry.clear();
}
