function list(items) {
    return h("ul", items.map(
        item => h("li", `Item ${item}`)
    ));
} 

function numberList() {
    return h("div", [
        "Here is a list of numbers:",
        list([1,2,3])
    ]);
}

mount(mountPoint, numberList);
