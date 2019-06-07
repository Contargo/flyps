import {
  eventQueue,
  trigger,
  triggerImmediately,
  handling,
  rawHandling,
} from "./event";

/* global global */

let ticker = (function() {
  let fns = [];
  return {
    dispatch(fn) {
      fns.push(fn);
    },
    advance() {
      let fn = fns.pop();
      if (fn) fn();
    },
    size() {
      return fns.length;
    },
  };
})();

beforeEach(() => {
  global.console.warn = jest.fn();
  eventQueue.tickFn(ticker.dispatch);
});

describe("handling", () => {
  it("passes causes and event information to the handler", () => {
    let handler = handling("foo", (causes, eventId, ...args) => {
      expect(causes.event).toStrictEqual([eventId, args]);
      expect(eventId).toBe("foo");
      expect(args).toStrictEqual(["bar", "baz"]);

      return { succeed: true };
    });
    let context = handler("foo", "bar", "baz");
    expect(context.causes.event).toStrictEqual(["foo", ["bar", "baz"]]);
    expect(context.effects.succeed).toBeTruthy();
  });
});

describe("rawHandling", () => {
  it("passes context and event information to the handler", () => {
    let handler = rawHandling("foo", [], (context, eventId, ...args) => {
      expect(context.causes.event).toStrictEqual([eventId, args]);
      expect(eventId).toBe("foo");
      expect(args).toStrictEqual(["bar", "baz"]);

      context.effects = { succeed: true };
      return context;
    });
    let context = handler("foo", "bar", "baz");
    expect(context.causes.event).toStrictEqual(["foo", ["bar", "baz"]]);
    expect(context.effects.succeed).toBeTruthy();
  });
});

describe("trigger", () => {
  it("queues the call of the registered handler", () => {
    let handled = 0;
    handling("foo", () => handled++);
    trigger("foo");
    expect(handled).toBe(0);
    ticker.advance();
    expect(handled).toBe(1);
  });
  it("logs a warning for unknown events", () => {
    trigger("bar");
    ticker.advance();
    expect(global.console.warn).toHaveBeenCalledWith(
      "no handler registered for:",
      "bar",
    );
  });
});

describe("triggerImmediately", () => {
  it("calls the registered handler", () => {
    let handled = 0;
    handling("foo", () => handled++);
    triggerImmediately("foo");
    expect(handled).toBe(1);
  });
  it("logs a warning for unknown events", () => {
    triggerImmediately("bar");
    expect(global.console.warn).toHaveBeenCalledWith(
      "no handler registered for:",
      "bar",
    );
  });
});
