(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}(function () { 'use strict';

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  var data = signal({
    height: 1.8,
    weight: 78
  });
  var bmi = signalFn(withInputSignals(function () {
    return data;
  }, function (_ref) {
    var height = _ref.height,
        weight = _ref.weight;
    return weight / (height * height);
  }));
  var diagnose = signalFn(withInputSignals(function () {
    return bmi;
  }, function (bmi) {
    if (bmi < 18.5) return "underweight";
    if (bmi < 25) return "healthy";
    if (bmi < 30) return "overweight";
    return "obese";
  }));
  var color = signalFn(withInputSignals(function () {
    return diagnose;
  }, function (diagnose) {
    switch (diagnose) {
      case "underweight":
      case "overweight":
        return "orange";

      case "healthy":
        return "green";

      default:
        return "red";
    }
  }));

  function slider(key, value, min, max) {
    var step = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
    return h("input", {
      attrs: {
        type: "range",
        value: value,
        min: min,
        max: max,
        step: step
      },
      style: {
        width: "100%"
      },
      on: {
        input: function input(e) {
          data.update(function (data) {
            return _objectSpread({}, data, _defineProperty({}, key, e.target.value));
          });
        }
      }
    });
  }

  function calculator(_ref2) {
    var _ref3 = _slicedToArray(_ref2, 4),
        data = _ref3[0],
        bmi = _ref3[1],
        diagnose = _ref3[2],
        color = _ref3[3];

    var height = data.height,
        weight = data.weight;
    return h("div.bmi", [h("h3", "BMI calculator"), h("div", ["Height: ".concat(height, "m"), slider("height", height, 1.0, 2.2, 0.01)]), h("div", ["Weight: ".concat(weight, "kg"), slider("weight", weight, 30, 200)]), h("p", ["BMI: ".concat(Math.round(bmi)), " - ", h("strong", {
      style: {
        color: color
      }
    }, diagnose)])]);
  }

  mount(mountPoint, withInputSignals(function () {
    return [data, bmi, diagnose, color];
  }, calculator));

}));
