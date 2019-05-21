import { mount, unmount } from "./dom";
import { signal } from "./signal";

/* global global */

beforeEach(() => {
  global.console.warn = jest.fn();
  document.body.innerHTML = '<div id="my-view"></div>';
});

describe("mount", () => {
  it("calls the patch function on mount", () => {
    let patches = [];
    let patchFn = (root, prev, next) => {
      patches = [...patches, [prev, next]];
      return next;
    };
    let viewFn = () => "foo";

    mount(document.querySelector("#my-view"), viewFn, patchFn);

    expect(patches).toHaveLength(1);
    let [prev, next] = patches[0];
    expect(prev).toBeUndefined();
    expect(next).toBe("foo");
  });
  it("calls the patch function on view changes", () => {
    let patches = [];
    let patchFn = (root, prev, next) => {
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
  it("mounts only one view per root", () => {
    let patches = [];
    let patchFn = (root, prev, next) => {
      patches = [...patches, [prev, next]];
      return next;
    };
    let root = document.querySelector("#my-view");

    mount(root, () => "foo", patchFn);
    expect(patches).toHaveLength(1);

    mount(root, () => "bar", patchFn);
    expect(patches).toHaveLength(1);
    expect(global.console.warn).toHaveBeenCalledWith(
      "view already mounted to",
      root,
    );
  });
  it("can mount a view to the same root after unmount", () => {
    let patches = [];
    let patchFn = (root, prev, next) => {
      patches = [...patches, [prev, next]];
      return next;
    };
    let root = document.querySelector("#my-view");

    mount(root, () => "foo", patchFn);
    expect(patches).toHaveLength(1);

    unmount(root, () => {});

    mount(root, () => "bar", patchFn);
    expect(patches).toHaveLength(2);

    {
      let [prev, next] = patches[0];
      expect(prev).toBeUndefined();
      expect(next).toBe("foo");
    }

    {
      let [prev, next] = patches[1];
      expect(prev).toBeUndefined();
      expect(next).toBe("bar");
    }
  });
});

describe("unmount", () => {
  it("handles unmounting of unmounted roots", () => {
    let root = document.querySelector("#my-view");
    unmount(root, () => {});
    expect(global.console.warn).toHaveBeenCalledWith(
      "no mounted view found to unmount from",
      root,
    );
  });
  it("disconnects from view signal", () => {
    let s = signal("foo");
    let patched = 0;
    let freed = false;

    let viewSignal = mount(
      document.querySelector("#my-view"),
      () => s.value(),
      () => ++patched,
    );
    viewSignal.onFree(() => (freed = true));
    expect(patched).toBe(1);

    s.reset("bar");
    expect(patched).toBe(2);

    unmount(document.querySelector("#my-view"), () => {});
    expect(freed).toBeTruthy();

    s.reset("baz");
    expect(patched).toBe(2);
  });
  it("calls the cleanup function and returns its result", () => {
    let root = document.querySelector("#my-view");
    let cleanedup = false;

    mount(root, () => {}, () => "foo");
    let unmounted = unmount(root, node => {
      expect(node).toBe("foo");
      cleanedup = true;
      return "some-value";
    });
    expect(unmounted).toBe("some-value");
    expect(cleanedup).toBeTruthy();
  });
});
