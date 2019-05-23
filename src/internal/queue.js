export function queue(nextTick = window.requestAnimationFrame) {
  let queue = [];
  let scheduled = false;

  return {
    enqueue(fn) {
      queue = [...queue, fn];
      this.schedule();
    },
    flush() {
      scheduled = false;

      let fns = [...queue];
      queue = [];

      fns.forEach(fn => fn());
    },
    schedule() {
      if (!scheduled) {
        scheduled = true;
        nextTick(this.flush);
      }
    },
    tickFn(fn) {
      nextTick = fn;
    },
  };
}
