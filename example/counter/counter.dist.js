(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}(function () { 'use strict';

  var count = signal(0);

  function counter() {
    return h("div.counter", ["Number of clicks: ", count.value(), h("button", {
      style: {
        margin: "10px"
      },
      on: {
        click: function click() {
          return count.update(function (count) {
            return count + 1;
          });
        }
      }
    }, "Click!")]);
  }

  mount(mountPoint, counter);

}));
