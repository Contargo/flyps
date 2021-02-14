import { cause, causing, clearCausings } from "./cause";

/* global global */

beforeEach(() => {
  global.console.warn = jest.fn();
  clearCausings();
});

describe("cause", () => {
  it("handles causings", () => {
    causing("foo", value => value + "baz");
    let result = cause("foo", "bar");
    expect(result).toEqual("barbaz");
  });
  it("logs a warning for unknown causings", () => {
    cause("foo", "bar");
    expect(global.console.warn).toHaveBeenCalledWith(
      "no causing registered for",
      "foo",
    );
  });
});

describe("causing", () => {
  it("logs a warning when overwriting an existing causing", () => {
    causing("foo", () => {});
    causing("foo", () => {});
    expect(global.console.warn).toHaveBeenCalledWith(
      "overwriting causing for",
      "foo",
    );
  });
});
