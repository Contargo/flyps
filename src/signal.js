/**
 * A signal is a container used to store state information. A signal can be made
 * to change state by calling `reset` or `update`.
 * Outputs can be connected to signals. Whenever a signals state changes, all
 * connected outputs will be triggered.
 */
export function signal(state) {
  let outputs = [];

  return {
    value() {
      return state;
    },
    reset(next) {
      let prev = state;
      state = next;

      if (prev !== next) {
        outputs.forEach(fn => fn(this, prev, next));
      }
    },
    update(fn, ...args) {
      this.reset(fn.call(null, state, ...args));
    },
    connect(fn) {
      outputs = [...outputs, fn];

      return () => {
        outputs = outputs.filter(s => s !== fn);
      };
    },
  };
}
