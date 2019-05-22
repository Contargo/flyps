import { mount } from "./dom";
import { signal } from "./signal";

/* global global */

beforeEach(() => {
  global.console.warn = jest.fn();
  document.body.innerHTML = '<div id="my-view"></div>';
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

    expect(patches).toHaveLength(2);
    let [prev, next] = patches[1];
    expect(prev).toBe("foo");
    expect(next).toBe("bar");
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
    expect(patched).toBe(2);

    unmount();

    s.reset("baz");
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
