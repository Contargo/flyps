/**
 * A signal is a container used to store state information. A signal can be made
 * to change state by calling `reset` or `update`.
 * Outputs can be connected to signals. Whenever the state of a signal changes,
 * all connected outputs will be triggered.
 */
export function signal(state) {
  let outputs = [];

  return {
    value() {
      if (context) {
        context.inputs = [...(context.inputs || []), this];
      }
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

      let disconnect = () => {
        outputs = outputs.filter(s => s !== fn);
      };
      return disconnect;
    },
  };
}

/**
 * A signalFn is a signal that computes its state by running `fn`. It keeps
 * track of and connects to all referenced input signals during the function
 * call. If the state of any of the connected input signals change, the state of
 * signalFn gets re-computed (which means re-running `fn`). The state hold by the
 * signalFn is the return value of `fn` and can be preset using `state`. Like
 * with signals, outputs can be connected. Whenever the state of a signalFn
 * changes, all connected outputs will be triggered.
 */
export function signalFn(fn, state) {
  let inputs = [];
  let outputs = [];
  let disconnectors = new WeakMap();
  let freeWatchers = [];
  let dirty = true;

  return {
    value() {
      if (context) {
        context.inputs = [...(context.inputs || []), this];
      }
      if (dirty) {
        this.run();
      }
      return state;
    },
    run() {
      let [context, next] = trackInputs(fn);
      dirty = false;

      let trackedInputs = context.inputs || [];
      let connectingInputs = arrayDiff(trackedInputs, inputs);
      let disconnectingInputs = arrayDiff(inputs, trackedInputs);
      inputs = [...trackedInputs];
      connectingInputs.forEach(s => {
        let disconnect = s.connect(this.strobe.bind(this));
        disconnectors.set(s, disconnect);
      });
      disconnectingInputs.forEach(s => {
        let disconnect = disconnectors.get(s);
        disconnectors.delete(s);
        disconnect();
      });

      let prev = state;
      state = next;

      if (prev !== next) {
        outputs.forEach(fn => fn(this, prev, next));
      }
    },
    dirty() {
      return dirty;
    },
    strobe() {
      dirty = true;
      this.run();
    },
    connect(fn) {
      if (dirty) {
        this.run();
      }

      outputs = [...outputs, fn];

      let disconnect = () => {
        outputs = outputs.filter(s => s !== fn);

        if (outputs.length === 0) {
          this.free();
        }
      };
      return disconnect;
    },
    free() {
      inputs.forEach(s => {
        let disconnect = disconnectors.get(s);
        disconnectors.delete(s);
        disconnect();
      });
      inputs = [];
      dirty = true;
      state = undefined;

      freeWatchers.forEach(fn => fn());
      freeWatchers = [];
    },
    onFree(fn) {
      freeWatchers = [...freeWatchers, fn];
    },
    inputs() {
      if (dirty) {
        this.run();
      }
      return [...inputs];
    },
  };
}

/**
 * Holds the current, global context for a signalFn. A context urges referenced
 * signals to register as input signals. signalFns can therefore use a context
 * for tracking and book keeping of referenced input signals.
 */
let context = undefined;

/**
 * Tracks all referenced signals while running `fn` by setting a new global
 * context. The return value is a tuple of the used context and return value of
 * `fn`. After running `fn`, the previous context gets restored.
 */
function trackInputs(fn) {
  let prevContext = context;
  context = {};
  let res = [context, fn()];
  context = prevContext;
  return res;
}

function arrayDiff(arr, other) {
  return arr.filter(v => other.indexOf(v) < 0);
}
