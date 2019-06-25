function simple() {
    return h("div", [
        h("p", "I am a simple view!"),
        h("p.special", [
            "I render text ",
            h("strong", "bold"),
            " and ",
            h("span", { style: { color: "red" } }, "red"),
            "."
        ])
    ]);
} 

mount(mountPoint, simple);
