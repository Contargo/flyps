import { mount } from "./dom";
import { signal } from "./signal";
import { renderQueue } from "./dom";

/* global global */

let ticker = (function() {
  let fns = [];
  return {
    dispatch(fn) {
      fns = [...fns, fn];
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
  document.body.innerHTML = '<div id="my-view"></div>';
  renderQueue.tickFn(ticker.dispatch);
});

describe("mount", () => {
  it("calls the patch function on mount", () => {
    let patches = [];
    let patchFn = (prev, next) => {
      patches = [...patches, [prev, next]];
      return next;
    };
    let viewFn = () => "foo";

    let root = document.querySelector("#my-view");
    mount(root, viewFn, patchFn);

    expect(patches).toHaveLength(1);
    let [prev, next] = patches[0];
    expect(prev).toBe(root);
    expect(next).toBe("foo");
  });
  it("calls the patch function on view changes", () => {
    let patches = [];
    let patchFn = (prev, next) => {
      patches = [...patches, [prev, next]];
      return next;
    };
    let s = signal("foo");
    let viewFn = () => s.value();

    mount(document.querySelector("#my-view"), viewFn, patchFn);

    s.reset("bar");
    ticker.advance();

    expect(patches).toHaveLength(2);
    let [prev, next] = patches[1];
    expect(prev).toBe("foo");
    expect(next).toBe("bar");
  });
  it("renders only when view is dirty", () => {
    let patches = [];
    let patchFn = (prev, next) => {
      patches = [...patches, [prev, next]];
      return next;
    };
    let s = signal("foo");
    let viewFn = () => s.value();

    mount(document.querySelector("#my-view"), viewFn, patchFn);

    s.reset("bar");
    s.reset("baz");

    expect(ticker.size()).toBe(1);
    ticker.advance();

    expect(patches).toHaveLength(2);
    let [prev, next] = patches[1];
    expect(prev).toBe("foo");
    expect(next).toBe("baz");
  });
});

describe("unmount", () => {
  it("disconnects from view signal", () => {
    let s = signal("foo");
    let patched = 0;

    let unmount = mount(
      document.querySelector("#my-view"),
      () => s.value(),
      () => ++patched,
      () => {},
    );
    expect(patched).toBe(1);

    s.reset("bar");
    ticker.advance();
    expect(patched).toBe(2);

    unmount();

    s.reset("baz");
    ticker.advance();
    expect(patched).toBe(2);
  });
  it("calls the cleanup function and returns its result", () => {
    let root = document.querySelector("#my-view");
    let cleanedup = false;

    let unmount = mount(
      root,
      () => {},
      () => "foo",
      node => {
        expect(node).toBe("foo");
        cleanedup = true;
        return "some-value";
      },
    );

    let unmounted = unmount();
    expect(unmounted).toBe("some-value");
    expect(cleanedup).toBeTruthy();
  });
});
