(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}(function () { 'use strict';

    function list(items) {
      return h("ul", items.map(function (item) {
        return h("li", "Item ".concat(item));
      }));
    }

    function numberList() {
      return h("div", ["Here is a list of numbers:", list([1, 2, 3])]);
    }

    mount(mountPoint, numberList);

}));
