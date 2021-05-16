import {
  clearHandlers,
  eventQueue,
  trigger,
  triggerImmediately,
  handler,
  rawHandler,
  injectCause,
  effectsInterceptor,
} from "./event";
import { clearCausings, causing } from "./cause";
import { clearEffectors, effector } from "./effect";

/* global global */

let ticker = (function () {
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
  clearHandlers();
  clearCausings();
  clearEffectors();
});

describe("handler", () => {
  it("passes causes and event information to the handlerFn", () => {
    let handlerFn = handler("foo", (causes, eventId, ...args) => {
      expect(causes.event).toStrictEqual([eventId, args]);
      expect(eventId).toBe("foo");
      expect(args).toStrictEqual(["bar", "baz"]);

      return { succeed: true };
    });
    let context = handlerFn("foo", "bar", "baz");
    expect(context.causes.event).toStrictEqual(["foo", ["bar", "baz"]]);
    expect(context.effects.succeed).toBeTruthy();
  });
  it("injects the db cause into the context", () => {
    let called = false;
    let handlerFn = handler("foo", causes => {
      expect(causes.db).toBe("value");
      called = true;
    });
    causing("db", () => "value");
    handlerFn("foo");
    expect(called).toBe(true);
  });
  it("handles effects from context", () => {
    let succeed = false;
    let handlerFn = handler("foo", () => ({ bar: "baz" }));
    effector("bar", arg => {
      expect(arg).toBe("baz");
      succeed = true;
    });
    expect(succeed).toBeFalsy();
    handlerFn("foo");
    expect(succeed).toBeTruthy();
  });
});

describe("rawHandler", () => {
  it("passes context and event information to the handler", () => {
    let handlerFn = rawHandler("foo", context => {
      let [eventId, args] = context.causes.event;
      expect(eventId).toBe("foo");
      expect(args).toStrictEqual(["bar", "baz"]);
      context.effects = { succeed: true };
      return context;
    });
    let context = handlerFn("foo", "bar", "baz");
    expect(context.causes.event).toStrictEqual(["foo", ["bar", "baz"]]);
    expect(context.effects.succeed).toBeTruthy();
  });
  it("chains and runs interceptors in correct order", () => {
    let handlerFn = rawHandler("foo", context => context, [
      dummyInterceptor("a"),
      dummyInterceptor("b"),
      dummyInterceptor("c"),
    ]);
    let context = handlerFn("foo");
    expect(context.before).toEqual(["a", "b", "c"]);
    expect(context.after).toEqual(["c", "b", "a"]);
  });
  it("logs a warning when overwriting an existing handler", () => {
    rawHandler("foo", context => context);
    rawHandler("foo", context => context);
    expect(global.console.warn).toHaveBeenCalledWith(
      "overwriting handler for",
      "foo",
    );
  });
});

describe("trigger", () => {
  it("queues the call of the registered handler", () => {
    let handled = 0;
    handler("foo", () => handled++);
    trigger("foo");
    expect(handled).toBe(0);
    ticker.advance();
    expect(handled).toBe(1);
  });
  it("logs a warning for unknown events", () => {
    trigger("bar");
    ticker.advance();
    expect(global.console.warn).toHaveBeenCalledWith(
      "no handler registered for",
      "bar",
    );
  });
});

describe("triggerImmediately", () => {
  it("calls the registered handler", () => {
    let handled = 0;
    handler("foo", () => handled++);
    triggerImmediately("foo");
    expect(handled).toBe(1);
  });
  it("logs a warning for unknown events", () => {
    triggerImmediately("bar");
    expect(global.console.warn).toHaveBeenCalledWith(
      "no handler registered for",
      "bar",
    );
  });
});

describe("injectCause", () => {
  it("injects the causes into the context", () => {
    causing("foo", () => "bar");
    let interceptor = injectCause("foo");
    let handlerFn = interceptor(context => context);
    let context = handlerFn({ causes: {} });
    expect(context.causes.foo).toBe("bar");
  });
});

describe("effectsInterceptor", () => {
  it("runs the effects registered in the context", () => {
    let called = false;
    effector("foo", arg => {
      expect(arg).toBe("bar");
      called = true;
    });
    let handlerFn = effectsInterceptor(context => context);
    handlerFn({ effects: { foo: "bar" } });
    expect(called).toBeTruthy();
  });
});
