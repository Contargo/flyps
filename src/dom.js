import { signalFn } from "./signal";
import { queue } from "./internal/queue";

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

export const renderQueue = queue();

/**
 * Mounts the result of `viewFn` as a replacement of `root`.
 *
 * The view function is wrapped inside a signal, therefore the view re-computes
 * whenever a state change in any referenced input signal gets detected.
 *
 * As `mount` only tries to make minimal assumptions on how the DOM gets patched
 * a `patchFn` and `cleanupFn` must be provided. What a view function returns
 * is up to the user but must be understood by the patch function. Whenever the
 * result of `viewFn` changes, `patchFn` gets called with the last result from
 * `patchFn` as the first argument (`root` on first call) and the result from
 * `viewFn` as the second argument. The patch function must ensure that the DOM
 * gets updated accordingly. On unmount, the `cleanupFn` gets called with the
 * last result from `patchFn` and must ensure the previously mounted DOM node
 * gets removed from the DOM.
 *
 * @param {DOMNode} root The root DOM node.
 * @param {function} viewFn The view function.
 * @param {function} patchFn The patch function.
 * @param {function} cleanupFn The cleanup function.
 * @returns {function} A function to unmount the mounted view from the DOM.
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
 *   (prev, next) => {
 *     let el = htmlToElement(next);
 *     prev.parentNode.replaceChild(el, prev);
 *     return el;
 *   },
 *   prev => {
 *     return prev.parentNode.removeChild(el);
 *   }
 * );
 */
export function mount(root, viewFn, patchFn, cleanupFn) {
  let s = signalFn(viewFn);
  let dirty = true;

  let render = () => {
    if (dirty) {
      root = patchFn(root, s.value());
      dirty = false;
    }
  };

  render();

  let disconnect = s.connect(() => {
    dirty = true;
    renderQueue.enqueue(render);
  });

  return () => {
    disconnect();
    return cleanupFn(root);
  };
}
