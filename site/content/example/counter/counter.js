let count = signal(0);

function counter() {
  return h("div.counter", [
    "Number of clicks: ",
    count.value(),
    h(
      "button",
      {
        style: { margin: "10px" },
        on: { click: () => count.update(count => count + 1) }
      },
      "Click!"
    )
  ]);
}

mount(mountPoint, counter);
