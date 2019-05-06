import { signal } from "./signal";

describe("signal", () => {
  it("returns its current value", () => {
    let s = signal("foo");
    expect(s.value()).toBe("foo");
  });
  it("resets its value", () => {
    let s = signal("foo");
    s.reset("bar");
    expect(s.value()).toBe("bar");
  });
  it("updates its value", () => {
    let s = signal("foo");
    s.update(state => state + "bar");
    expect(s.value()).toBe("foobar");
  });
  it("triggers connected outputs for new values", () => {
    let updates = 0;
    let s = signal("foo");
    s.connect(() => updates++);
    s.reset("bar");

    expect(updates).toBe(1);
  });
  it("ignores outputs for equal values", () => {
    let updates = 0;
    let s = signal("foo");
    s.connect(() => updates++);
    s.reset("foo");

    expect(updates).toBe(0);
  });
  it("passes information when triggering connected outputs", () => {
    let updates = [];
    let triggerFn = (signal, prev, next) => {
      updates = [...updates, { signal, prev, next }];
    };
    let s = signal("foo");
    s.connect(triggerFn);
    s.reset("bar");

    expect(updates.length).toBe(1);
    expect(updates[0].signal).toBe(s);
    expect(updates[0].prev).toBe("foo");
    expect(updates[0].next).toBe("bar");
  });
  it("disconnects a connected output", () => {
    let outputs = [0, 0];
    let s = signal("foo");
    s.connect(() => outputs[0]++);
    let disconnect = s.connect(() => outputs[1]++);
    s.reset("bar");
    disconnect();
    s.reset("baz");

    expect(outputs[0]).toBe(2);
    expect(outputs[1]).toBe(1);
  });
});
