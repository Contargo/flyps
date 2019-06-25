let color = signal("#000");
let now = signal(new Date());

setInterval(() => now.reset(new Date()), 1000);

function display() {
    let time = now.value().toTimeString().split(" ")[0];
    return h("h1", { style: { color: color.value() } }, time);
} 

function colorInput() {
    return h("input", {
        attrs: { type: "color", value: color.value() },
        on: { input: e => color.reset(e.target.value) },
    });
}

function clock() {
    return h("div.clock", [display(), colorInput()]);
}

mount(mountPoint, clock);
