import "./batteries";
import { cause } from "./cause";
import { db } from "./db";
import { effect } from "./effect";
import { trigger } from "./event";
import { connect } from "./connector"

jest.mock("./event");

let xhrs = [];
beforeEach(() => {
  xhrs = [];
  trigger.mockClear();
});

window.XMLHttpRequest = function () {
  let xhr = {
    open: jest.fn(),
    send: jest.fn(),
    setRequestHeader: jest.fn(),
  };
  // remember created xhr requests
  xhrs = [...xhrs, xhr];
  return xhr;
};

describe("db cause", () => {
  it("should return the state of db", () => {
    db.reset({ foo: "bar" });
    expect(cause("db")).toStrictEqual({ foo: "bar" });
  });
});

describe("db connector", () => {
  it("should return the state of db", () => {
    db.reset({ foo: "bar" });
    expect(connect("db").value()).toStrictEqual({ foo: "bar" });
  });
});

describe("now cause", () => {
  it("should return the current time", () => {
    let now = Date.now();
    let causedNow = cause("now");
    let delta = (causedNow - now) / 1000;
    expect(delta).toBeCloseTo(0);
  });
});

describe("db effect", () => {
  it("should reset the state of db", () => {
    effect("db", { foo: "baz" });
    expect(db.value()).toStrictEqual({ foo: "baz" });
  });
});

describe("trigger effect", () => {
  it("should trigger the described event", () => {
    effect("trigger", ["foo", "bar", "baz"]);
    expect(trigger).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveBeenCalledWith("foo", "bar", "baz");
  });
});

describe("xhr effect", () => {
  it("has sane defaults", () => {
    effect("xhr", {});

    const xhr = xhrs[0];
    expect(xhr.open.mock.calls[0]).toEqual(["GET", undefined]);
    expect(xhr.send.mock.calls[0]).toEqual([undefined]);
    expect(xhr.responseType).toBe("");
    expect(xhr.timeout).toBe(3000);
    expect(xhr.setRequestHeader.mock.calls.length).toBe(0);
  });
  it("overrides defaults", () => {
    effect("xhr", {
      url: "/foo",
      method: "POST",
      responseType: "json",
      timeout: 42,
      headers: { Foo: "my-foo", Bar: "my-bar" },
      data: "some-data",
    });

    const xhr = xhrs[0];
    expect(xhr.open.mock.calls[0]).toEqual(["POST", "/foo"]);
    expect(xhr.send.mock.calls[0]).toEqual(["some-data"]);
    expect(xhr.responseType).toBe("json");
    expect(xhr.timeout).toBe(42);
    expect(xhr.setRequestHeader.mock.calls[0]).toEqual(["Foo", "my-foo"]);
    expect(xhr.setRequestHeader.mock.calls[1]).toEqual(["Bar", "my-bar"]);
  });
  it("triggers an event on success", () => {
    effect("xhr", {
      onSuccess: ["success", "foo"],
      onError: ["error", "foo"],
    });

    const xhr = xhrs[0];
    [200, 201, 202, 204, 206, 304].forEach(status => {
      trigger.mockClear();
      xhr.onload.call({
        status: status,
        statusText: "${status}",
        response: "response",
      });
      expect(trigger).toHaveBeenCalledTimes(1);
      expect(trigger).toHaveBeenCalledWith("success", "foo", "response");
    });
  });
  it("triggers an event on error", () => {
    effect("xhr", {
      onSuccess: ["success", "foo"],
      onError: ["error", "foo"],
    });

    const xhr = xhrs[0];
    const response = {
      status: 500,
      statusText: "Server error",
      response: "response",
    };
    xhr.onload.call(response);
    expect(trigger).toHaveBeenCalledTimes(1);
    expect(trigger).toHaveBeenCalledWith("error", "foo", response);
  });
  it("ignores success if onSuccess is unset", () => {
    effect("xhr", {});

    const xhr = xhrs[0];
    const response = {
      status: 200,
      statusText: "OK",
      response: "response",
    };
    xhr.onload.call(response);
    expect(trigger).not.toHaveBeenCalled();
  });
  it("ignores errors if onError is unset", () => {
    effect("xhr", {});

    const xhr = xhrs[0];
    const response = {
      status: 500,
      statusText: "Server error",
      response: "response",
    };
    xhr.onload.call(response);
    expect(trigger).not.toHaveBeenCalled();
  });
});
