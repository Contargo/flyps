import { signal, signalFn } from "./signal";

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

describe("signalFn", () => {
  it("returns the result of fn as its current value", () => {
    let runs = 0;
    let s = signalFn(() => ++runs);
    expect(s.value()).toBe(1);
  });
  it("connects to input signals", () => {
    let s1 = signal("foo");
    let s2 = signalFn(() => s1.value());
    let s3 = signalFn(() => s2.value());

    expect(s3.inputs()).toEqual([s2]);
    expect(s2.inputs()).toEqual([s1]);
  });
  it("disconnects from unused input signals", () => {
    let s1 = signal("foo");
    let s2 = signal("bar");
    let s3 = signalFn(() => (s1.value() === "foo" ? s2.value() : s1.value()));

    expect(s3.inputs()).toEqual([s1, s2]);
    s1.reset("baz");
    expect(s3.inputs()).toEqual([s1]);
  });
  it("tracks chain of input signals properly (restores context)", () => {
    let s1 = signalFn(() => "s1");
    let s2 = signalFn(() => "s2");
    let s3 = signalFn(() => s1.value() + s2.value());

    expect(s3.inputs()).toEqual([s1, s2]);
    expect(s2.inputs()).toEqual([]);
    expect(s1.inputs()).toEqual([]);
  });
  it("triggers connected outputs for new values", () => {
    let updates = 0;
    let s1 = signal("foo");
    let s2 = signalFn(() => s1.value());
    s2.connect(() => updates++);
    s1.reset("bar");

    expect(updates).toBe(1);
  });
  it("ignores outputs for equal values", () => {
    let updates = 0;
    let s1 = signal("foo");
    let s2 = signalFn(() => {
      s1.value();
      return "baz";
    });
    s2.connect(() => updates++);
    s1.reset("bar");

    expect(s2.value()).toBe("baz");
    expect(updates).toBe(0);
  });
  it("passes information when triggering connected outputs", () => {
    let updates = [];
    let triggerFn = (signal, prev, next) => {
      updates = [...updates, { signal, prev, next }];
    };
    let s1 = signal("foo");
    let s2 = signalFn(() => s1.value());
    s2.connect(triggerFn);
    s1.reset("bar");

    expect(updates.length).toBe(1);
    expect(updates[0].signal).toBe(s2);
    expect(updates[0].prev).toBe("foo");
    expect(updates[0].next).toBe("bar");
  });
  it("disconnects a connected output", () => {
    let outputs = [0, 0];
    let s1 = signal("foo");
    let s2 = signalFn(() => s1.value());
    s2.connect(() => outputs[0]++);
    let disconnect = s2.connect(() => outputs[1]++);
    s1.reset("bar");
    disconnect();
    s1.reset("baz");

    expect(outputs[0]).toBe(2);
    expect(outputs[1]).toBe(1);
  });
  it("frees itself if there are no more connected outputs", () => {
    let runs = 0;
    let s1 = signal("foo");
    let s2 = signalFn(() => {
      runs++;
      return s1.value();
    });
    let disconnect = s2.connect(() => {});

    expect(runs).toBe(1);
    expect(s2.dirty()).toBeFalsy();

    disconnect();
    s1.reset("bar");

    expect(runs).toBe(1);
    expect(s2.dirty()).toBeTruthy();
  });
  it("connects to a referenced signal only once", () => {
    let s1 = signal("foo");
    let s2 = signalFn(() => s1.value() + s1.value());
    let disconnect = s2.connect(() => {});
    expect(s2.inputs()).toEqual([s1]);
    expect(disconnect).not.toThrow();
  });
  it("connects to a referenced signalFn only once", () => {
    let s1 = signalFn(() => "foo");
    let s2 = signalFn(() => s1.value() + s1.value());
    let disconnect = s2.connect(() => {});
    expect(s2.inputs()).toEqual([s1]);
    expect(disconnect).not.toThrow();
  });
  it("notifies watchers when freeing itself", () => {
    let freed = 0;
    let s = signalFn(() => "foo");
    let disconnect = s.connect(() => {});
    s.onFree(() => freed++);

    expect(freed).toBe(0);
    disconnect();
    expect(freed).toBe(1);
  });
});
