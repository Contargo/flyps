import { signalFn } from "./signal";

/**
 * The dom module helps to connect view functions with signal circuits. A view
 * can be mounted by passing a function that returns a views representation.
 * mount/unmount will then take care of the signal creation and lifetime
 * management for you. Also, mount/unmount helps in doing the necessary
 * side-effects to the DOM by calling the provided `patchFn` (mount) and
 * `cleanupFn` (unmount). The goal is to provide a simple interface consisting
 * of these two functions but perform optimized rendering based on signals.
 *
 * @module dom
 */

/** Holds the root dom nodes with mounted views. */
let roots = new Map();

/** Holds the disconnectors per signal. */
let disconnectors = new WeakMap();

/**
 * Mounts the `viewFn` as a child of `root`. Note that there can only be one
 * mounted view per root.
 *
 * The view function is wrapped inside a signal, therefore the view re-computes
 * whenever a state change in any referenced input signal gets detected.
 *
 * As `mount` only tries to make minimal assumptions on how the DOM gets patched
 * a `patchFn` must be provided. What a view function returns is up to the user
 * but must be understand by the patch function. Whenever the result of `viewFn`
 * changes, `patchFn` gets called with the `root` as the first argument, the
 * last result from `patchFn` as the second argument and the result from
 * `viewFn` as the third argument. The patch function must ensure that the DOM
 * gets updated accordingly.
 *
 * @param {DOMNode} root The root DOM node.
 * @param {function} viewFn The view function.
 * @param {function} patchFn The patch function.
 * @returns {Signal} The view signal.
 *
 * @example
 *
 * function htmlToElement(html) {
 *   let template = document.createElement('template');
 *   template.innerHTML = html;
 *   return template.content.firstChild;
 * }
 *
 * // Mount with a really simple patch function that creates new elements from
 * // text. Note: This solution is _very_ limited and is only used for
 * // demonstration purposes.
 * mount(document.querySelector("#my-view"),
 *   () => "<h1>Hello World!</h1>",
 *   (root, prev, next) => {
 *     let el = htmlToElement(next);
 *     if (prev) {
 *       root.replaceChild(el, prev);
 *     } else {
 *       root.appendChild(el);
 *     }
 *     return el;
 *   }
 * );
 */
export function mount(root, viewFn, patchFn) {
  if (roots.has(root)) {
    console.warn("view already mounted to", root);
    return;
  }

  let render = next => {
    let [s, prev] = roots.get(root);
    prev = patchFn(root, prev, next);
    roots.set(root, [s, prev]);
  };

  let s = signalFn(viewFn);
  let prev = patchFn(root, undefined, s.value());
  roots.set(root, [s, prev]);

  let disconnect = s.connect((signal, prev, next) => render(next));
  disconnectors.set(s, disconnect);

  return s;
}

/**
 * Unmounts a mounted view from `root`.
 *
 * As `unmount` only tries to make minimal assumptions on how the DOM gets
 * patched a `cleanupFn` must be provided. It gets called with the last result
 * from `patchFn` used when mounting the view and must ensure any created DOM
 * nodes are removed from `root`.
 *
 * @param {DOMNode} root The root DOM node.
 * @param {function} cleanupFn The cleanup function.
 * @return {*} The return value from `cleanupFn`.
 *
 * @example
 *
 * // Given the example from `mount`, this is an example how to cleanup the
 * // created elements.
 * unmount(document.querySelector("#my-view"), (el) => {
 *   return el.parentNode.removeChild(el);
 * });
 */
export function unmount(root, cleanupFn) {
  if (!roots.has(root)) {
    console.warn("no mounted view found to unmount from", root);
    return;
  }

  let [s, prev] = roots.get(root);
  roots.delete(root);

  let disconnect = disconnectors.get(s);
  disconnectors.delete(s);
  disconnect();

  return cleanupFn(prev);
}
