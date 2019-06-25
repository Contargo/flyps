import { signal, signalFn, withInputSignals } from "flyps";
import { h, mount } from "flyps-dom-snabbdom";

window.signal = signal;
window.signalFn = signalFn;
window.withInputSignals = withInputSignals;

window.h = h;
window.mount = mount;
