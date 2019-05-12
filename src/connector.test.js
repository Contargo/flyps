import { clearConnectors, connect, connector, rawConnector } from "./connector";
import { signal, signalFn } from "./signal";

global.console.warn = jest.fn();

beforeEach(() => clearConnectors());

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
