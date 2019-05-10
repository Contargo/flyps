import { signalFn } from "./signal";

/**
 * Connectors
 *
 * A connector is a helper to simplify building signal circuits. Connectors
 * give access to signals. By providing a connectors identifier it's possible
 * to connect to a specific signal without the need of explicit interconnections
 * in your code (loose coupling). Connectors can be created by passing a
 * function that returns a connectors state. The connector will then take care
 * of the signal creation and lifetime management for you.
 */

let registry = new Map();

/**
 * Returns a function that calls `fn` with a list of values extracted from the
 * provided signals returned by `inputsFn`. Arguments passed to the returned
 * function are transparently passed to `fn`. `inputsFn` is a function that
 * returns one or many input signals.
 *
 * @example
 *
 *  let fn = withInputSignals(
 *    () => signal("foo"),
 *    (s, arg) => s + arg,
 *  );
 *  fn("bar"); // "foobar"
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
 */
export function connect(connectorId) {
  let connectorFn = registry.get(connectorId);
  if (computationFn) {
    return computationFn(connectorId);
  }
  console.warn("no connector registered for:", connectorId);
}

/**
 * Registers a connector identified by `connectorId`. `connectorId` is a simple
 * keyword. `computationFn` is a function which gets passed one argument,
 * `connectorId` and must return the connectors state.
 *
 * The computation function is wrapped inside a signal, therefore the connector
 * re-computes whenever a state change in any referenced input signal gets
 * detected.
 */
export function connector(connectorId, computationFn) {
  return rawConnector(connectorId, connectorId =>
    signalFn(() => computationFn(connectorId)),
  );
}

/**
 * Registers a raw connector identified by `connectorId`. `connectorId` is a
 * simple keyword. `connectorFn` is a function which gets one argument,
 * `connectorId` and must return a `signalFn`.
 */
export function rawConnector(connectorId, connectorFn) {
  registry.set(connectorId, connectorFn);
  return connectorFn;
}

/**
 * Clears all registered connectors.
 */
export function clearConnectors() {
  registry.clear();
}
