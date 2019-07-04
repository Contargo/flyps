[![npm][npm-badge]][npm-url]
[![build][build-badge]][build-url]
[![coverage][coverage-badge]][coverage-url]

Flyps
=====

Flyps is a light-weight library with powerful tools, which help developers
build modular applications that are [composable], [functional reactive] and
[pure].

[composable]: https://en.wikipedia.org/wiki/Function_composition_(computer_science)
[functional reactive]: https://en.wikipedia.org/wiki/functional_reactive_programming
[pure]: https://en.wikipedia.org/wiki/Functional_programming#Pure_functions

# Getting started

You can install flyps via npm:

`npm i flyps`

### Create a signal

`Signals` are the core principle of flyps and are used everywhere.

```
import { signal } from "flyps";

const counter = signal(1);
```

### Change the value of a signal

A signal can be updated via a function (`signal::update`) or replaced with a new value (`signal::reset`).

```
const counter = signal(0);           // value = 0
counter.update(value => value + 1);  // value = 1
counter.reset(0);                    // value = 0
```

### Render view

Views can be rendered with the `mount` function.

```
import { mount } from "flyps";

mount(document.querySelector("#my-view"),
  () => "<h1>Hello World!</h1>",
  (prev, next) => {
    let el = htmlToElement(next);
    prev.parentNode.replaceChild(el, prev);
    return el;
  },
  prev => {
    return prev.parentNode.removeChild(el);
  }
);
```

For more complex views we suggest to add the [flyps-dom-snabbdom] extension, which adds support for [snabbdom] rendering.

### More Examples

More examples can be found on our flyps [homepage].



[npm-badge]: https://img.shields.io/npm/v/flyps.svg
[npm-url]: https://www.npmjs.com/package/flyps
[build-badge]: https://travis-ci.org/Contargo/flyps.svg?branch=master
[build-url]: https://travis-ci.org/Contargo/flyps
[coverage-badge]: https://coveralls.io/repos/github/Contargo/flyps/badge.svg?branch=master
[coverage-url]: https://coveralls.io/github/Contargo/flyps?branch=master
[homepage]: https://contargo.github.io/flyps/
[flyps-dom-snabbdom]: https://github.com/Contargo/flyps-dom-snabbdom/
[snabbdom]: https://github.com/snabbdom/snabbdom
