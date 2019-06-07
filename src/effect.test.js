import { clearEffectors, effect, effector } from "./effect";

/* global global */

beforeEach(() => {
  global.console.warn = jest.fn();
  clearEffectors();
});

describe("effect", () => {
  it("handles effects", () => {
    const result = {};
    effector("foo", value => (result.foo = value));
    effect("foo", "bar");
    expect(result).toEqual({ foo: "bar" });
  });
  it("logs a warning for unknown effectors", () => {
    effect("foo", "bar");
    expect(global.console.warn).toHaveBeenCalledWith(
      "no effector registered for:",
      "foo",
    );
  });
});

describe("effector", () => {
  it("logs a warning when overwriting an existing effector", () => {
    effector("foo", () => {});
    effector("foo", () => {});
    expect(global.console.warn).toHaveBeenCalledWith(
      "overwriting effector for",
      "foo",
    );
  });
});
