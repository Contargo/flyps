(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}(function () { 'use strict';

    var color = signal("#000");
    var now = signal(new Date());
    setInterval(function () {
      return now.reset(new Date());
    }, 1000);

    function display() {
      var time = now.value().toTimeString().split(" ")[0];
      return h("h1", {
        style: {
          color: color.value()
        }
      }, time);
    }

    function colorInput() {
      return h("input", {
        attrs: {
          type: "color",
          value: color.value()
        },
        on: {
          input: function input(e) {
            return color.reset(e.target.value);
          }
        }
      });
    }

    function clock() {
      return h("div.clock", [display(), colorInput()]);
    }

    mount(mountPoint, clock);

}));
