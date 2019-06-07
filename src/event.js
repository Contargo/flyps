import { queue } from "./internal/queue";

/**
 * The event module provides machanisms to trigger and handle the happening of
 * events. Raw event handlers are based on reading from and writing to contexts.
 * On top of the provided event contexts there is the concept of event handlers
 * having causes and describing effects. Therefore, an event handler is a pure
 * function that doesn't perform changes but describes them.
 *
 * @module event
 */

/** Holds the registered event handlers. */
let registry = new Map();

export const eventQueue = queue();

/**
 * Registers an event handler identified by `eventId`.
 *
 * The event handler gets called whenever an event with the provided `eventId`
 * gets triggered. It will receive a map of causes related to the event and must
 * return a map which describes the resulting effects. The resulting effects are
 * then performed by specific effect handlers and are not part of the event
 *
 * @param {string} eventId An event identifier.
 * @param {function} handlerFn A function which gets passed causes of the event
 *    and must return a map of effects that should be applied.
 */
export function handling(eventId, handlerFn) {
  return rawHandling(eventId, [], (context, eventId, ...args) => {
    context.effects = handlerFn(context.causes, eventId, ...args);
    return context;
  });
}

/**
 * Registers a raw event handler identified by `eventId`.
 *
 * The event handler gets called whenever an event with the provided `eventId`
 * gets triggered. It will receive a context related to the event and must
 * return a (modified) context. Interceptors can be added to actually perform
 * actions based on the resulting context.
 *
 * @param {string} eventId An event identifier.
 * @param {function} handlerFn A function which gets passed a context describing
 *    the causes of the event and modifies the context.
 */
export function rawHandling(eventId, interceptors, handlerFn) {
  let handler = (eventId, ...args) => {
    let context = {
      causes: {
        event: [eventId, args],
      },
      effects: {},
    };
    return handlerFn(context, eventId, ...args);
  };
  registry.set(eventId, handler);
  return handler;
}

/**
 * Enqueues an event for processing. Processing will not happen immediately, but
 * on the next tick after all previously triggered events were handled.
 *
 * @param {string} eventId The event identifier.
 * @param  {...any} args Additional arguments describing the event.
 */
export function trigger(eventId, ...args) {
  eventQueue.enqueue(() => handle(eventId, ...args));
}

/**
 * Triggers an event immediately without queueing.
 *
 * @param {string} eventId The event identifier.
 * @param  {...any} args Additional arguments describing the event.
 */
export function triggerImmediately(eventId, ...args) {
  handle(eventId, ...args);
}

function handle(eventId, ...args) {
  let handlerFn = registry.get(eventId);
  if (handlerFn) {
    return handlerFn(eventId, ...args);
  }
  console.warn("no handler registered for:", eventId);
}
