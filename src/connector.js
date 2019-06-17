import { signalFn } from "./signal";

/**
 * A connector is a helper to simplify building signal circuits. Connectors
 * give access to signals. By providing a connectors identifier it's possible
 * to connect to a specific signal without the need of explicit interconnections
 * in your code (loose coupling). Connectors can be created by passing a
 * function that returns a connectors state. The connector will then take care
 * of the signal creation and lifetime management for you.
 *
 * @module connector
 */

/** Holds the registered connectors. */
let registry = new Map();

/** Holds the created signals. */
let signalCache = new Map();

function cacheAndReturn(connectorId, signal) {
  // remove freed signals from the cache
  signal.onFree(() => signalCache.delete(connectorId));
  signalCache.set(connectorId, signal);
  return signal;
}

/**
 * Returns a new function that calls `fn` with a list of values extracted from
 * the provided signals returned by `inputsFn`. Arguments passed to the returned
 * function are transparently passed to `fn`. `inputsFn` is a function that
 * returns one or many input signals.
 *
 * @param {function} inputsFn A function returning input signals.
 * @param {function} fn A function expecting input signals as first argument.
 * @returns {function} A new function that applies the signal values extracted
 *    from `signalFn` together with the provided arguments to the original `fn`.
 *
 * @example
 *
 *  let fn = withInputSignals(
 *    () => signal("foo"),
 *    (s, arg) => s + arg,
 *  );
 *  fn("bar"); // => "foobar"
 *
 *  let fn = withInputSignals(
 *    () => [signal("foo"), signal("bar")],
 *    ([s1, s2], arg) => s1 + s2 + arg,
 *  );
 *  fn("baz"); // => "foobarbaz"
 */
export function withInputSignals(inputsFn, fn) {
  return (...args) => {
    let inputs = inputsFn(...args);
    let values = Array.isArray(inputs)
      ? inputs.map(s => s.value())
      : inputs.value();
    return fn(values, ...args);
  };
}

/**
 * Connects to the connector identified by `connectorId`. As a result, a signal
 * is returned which can then be used to access a stream of values reactively
 * changing over time.
 *
 * Note: for any given call to `connect` there must be a previous call to
 * `connector`, registering a computation function for `connectorId`.
 *
 * @param {string} connectorId The connector identifier.
 * @returns {Signal} The connector signal.
 */
export function connect(connectorId) {
  if (signalCache.has(connectorId)) {
    return signalCache.get(connectorId);
  }
  let connectorFn = registry.get(connectorId);
  if (connectorFn) {
    return cacheAndReturn(connectorId, connectorFn(connectorId));
  }
  console.warn("no connector registered for:", connectorId);
}

/**
 * Registers a connector identified by `connectorId`.
 *
 * The computation function is wrapped inside a signal, therefore the connector
 * re-computes whenever a state change in any referenced input signal gets
 * detected.
 *
 * @param {string} connectorId A connector identifier
 * @param {function} computationFn A function which gets passed one argument,
 *    `connectorId` and must return the connectors state.
 *
 * @example
 *
 *  let s = signal("foo");
 *  connector("myConnector",
 *    withInputSignals(
 *      () => s
 *      input => input + "bar"
 *    )
 *  );
 *
 *  connect("myConnector").value() // => "foobar"
 */
export function connector(connectorId, computationFn) {
  rawConnector(connectorId, connectorId =>
    signalFn(() => computationFn(connectorId)),
  );
}

/**
 * Registers a raw connector identified by `connectorId`.
 *
 * @param {string} connectorId A connector identifier
 * @param {function} connectorFn A function which gets one argument,
 *    `connectorId` and must return a `signalFn`.
 *
 * @example
 *
 *  let s = signal("foo");
 *  rawConnector("myConnector", () => s)
 *
 *  connect("myConnector").value() // => "foo"
 */
export function rawConnector(connectorId, connectorFn) {
  if (signalCache.has(connectorId)) {
    signalCache.delete(connectorId);
  }
  if (registry.has(connectorId)) {
    console.warn("overwriting connector for", connectorId);
  }
  registry.set(connectorId, connectorFn);
}

/**
 * Clears all registered connectors.
 */
export function clearConnectors() {
  registry.clear();
  signalCache.clear();
}
