import {
  clearHandlings,
  eventQueue,
  trigger,
  triggerImmediately,
  handling,
  rawHandling,
} from "./event";
import { clearEffectors, effector } from "./effect";

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

let dummyInterceptor = value => nextFn => context => {
  context.before = [...(context.before || []), value];
  context = nextFn(context);
  context.after = [...(context.after || []), value];
  return context;
};

beforeEach(() => {
  global.console.warn = jest.fn();
  eventQueue.tickFn(ticker.dispatch);
  clearHandlings();
  clearEffectors();
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
  it("handles effects from context", () => {
    let succeed = false;
    let handler = handling("foo", () => ({ bar: "baz" }));
    effector("bar", arg => {
      expect(arg).toBe("baz");
      succeed = true;
    });
    expect(succeed).toBeFalsy();
    handler("foo");
    expect(succeed).toBeTruthy();
  });
});

describe("rawHandling", () => {
  it("passes context and event information to the handler", () => {
    let handler = rawHandling("foo", [], context => {
      let [eventId, args] = context.causes.event;
      expect(eventId).toBe("foo");
      expect(args).toStrictEqual(["bar", "baz"]);
      context.effects = { succeed: true };
      return context;
    });
    let context = handler("foo", "bar", "baz");
    expect(context.causes.event).toStrictEqual(["foo", ["bar", "baz"]]);
    expect(context.effects.succeed).toBeTruthy();
  });
  it("chains and runs interceptors in correct order", () => {
    let handler = rawHandling(
      "foo",
      [dummyInterceptor("a"), dummyInterceptor("b"), dummyInterceptor("c")],
      context => context,
    );
    let context = handler("foo");
    expect(context.before).toEqual(["a", "b", "c"]);
    expect(context.after).toEqual(["c", "b", "a"]);
  });
  it("logs a warning when overwriting an existing handler", () => {
    rawHandling("foo", [], context => context);
    rawHandling("foo", [], context => context);
    expect(global.console.warn).toHaveBeenCalledWith(
      "overwriting handler for",
      "foo",
    );
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
