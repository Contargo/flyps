import {
  clearConnectors,
  connect,
  connector,
  rawConnector,
  withInputSignals,
} from "./connector";
import { signal, signalFn } from "./signal";

global.console.warn = jest.fn();

beforeEach(() => clearConnectors());

describe("withInputSignals", () => {
  it("injects extracted value from single input signal", () => {
    let fn = withInputSignals(
      () => signal("foo"),
      (s, ...args) => s + args.join(""),
    );
    expect(fn("bar")).toBe("foobar");
  });
  it("injects extracted values from multiple input signals", () => {
    let fn = withInputSignals(
      () => [signal("foo"), signal("bar")],
      ([s1, s2], ...args) => s1 + s2 + args.join(""),
    );
    expect(fn("baz")).toBe("foobarbaz");
  });
});

describe("connect", () => {
  it("returns connector signal", () => {
    connector("foo", () => "bar");
    expect(connect("foo").value()).toBe("bar");
  });
  it("returns undefined for unknown connectors", () => {
    expect(connect("bar")).toBeUndefined();
    expect(global.console.warn).toHaveBeenCalledWith(
      "no connector registered for:",
      "bar",
    );
  });
});

describe("connector", () => {
  it("passes connector id to computation function", () => {
    connector("bar", id => {
      expect(id).toBe("bar");
      return true;
    });
    expect(connect("bar").value()).toBe(true);
  });
});

describe("rawConnector", () => {
  it("transparently registers provided signal", () => {
    let signal = signalFn(() => "foo");
    rawConnector("foo", () => signal);
    expect(connect("foo")).toBe(signal);
  });
});

describe("clearConnectors", () => {
  it("clears registered connectors", () => {
    connector("foo", () => "bar");
    expect(connect("foo")).toBeDefined();
    clearConnectors();
    expect(connect("foo")).toBeUndefined();
  });
});
