import {
  clearConnectors,
  connect,
  connector,
  rawConnector,
  withInputSignals,
} from "./connector";
import { signal, signalFn } from "./signal";

/* global global */

beforeEach(() => {
  global.console.warn = jest.fn();
  clearConnectors();
});

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
  it("caches signals from connectors", () => {
    connector("foo", () => {});
    const s1 = connect("foo");
    const s2 = connect("foo");
    expect(s1).toBe(s2);
  });
  it("removes freed signals from cache", () => {
    connector("foo", () => {});
    const s1 = connect("foo");
    s1.free();
    const s2 = connect("foo");
    expect(s1).not.toBe(s2);
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
  it("removes cached signals when overwriting", () => {
    connector("foo", () => {});
    const s1 = connect("foo");
    connector("foo", () => {});
    const s2 = connect("foo");
    expect(s1).not.toBe(s2);
    expect(global.console.warn).toHaveBeenCalledWith(
      "overwriting connector for",
      "foo",
    );
  });
});

describe("rawConnector", () => {
  it("transparently registers provided signal", () => {
    let signal = signalFn(() => "foo");
    rawConnector("foo", () => signal);
    expect(connect("foo")).toBe(signal);
  });
  it("removes cached signals when overwriting", () => {
    rawConnector("foo", () => signalFn(() => "foo"));
    const s1 = connect("foo");
    rawConnector("foo", () => signalFn(() => "foo"));
    const s2 = connect("foo");
    expect(s1).not.toBe(s2);
    expect(global.console.warn).toHaveBeenCalledWith(
      "overwriting connector for",
      "foo",
    );
  });
});

describe("clearConnectors", () => {
  it("clears registered connectors", () => {
    connector("foo", () => "bar");
    expect(connect("foo")).toBeDefined();
    clearConnectors();
    expect(connect("foo")).toBeUndefined();
  });
  it("removes cached signals", () => {
    connector("foo", () => {});
    const s1 = connect("foo");
    clearConnectors();
    const s2 = connect("foo");
    expect(s1).not.toBe(s2);
    expect(s1).toBeTruthy();
    expect(s2).toBeFalsy();
  });
});
