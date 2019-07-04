import { causing } from "./cause";
import { effector } from "./effect";
import { trigger } from "./event";
import { db } from "./db";
import { connector } from "./connector";

/**
 * Cause that returns the state of the database signal.
 *
 * @see {@link db}
 */
causing("db", () => db.value());

/**
 * Connector that connects to the database state.
 *
 * @see {@link db}
 */
connector("db", () => db.value());

/**
 * Cause that returns the current time.
 */
causing("now", () => Date.now());

/**
 * Effect that resets the state of the database signal to a new value.
 *
 * @see {@link db}
 *
 * @example
 *
 * {
 *   db: { ...db, some: "value" }
 * }
 */
effector("db", updatedDb => db.reset(updatedDb));

/**
 * Effect that triggers an event with args.
 *
 * @example
 *
 * {
 *   trigger: ["event-id", "arg1", "arg2"]
 * }
 */
effector("trigger", ([eventId, ...args]) => trigger(eventId, ...args));

const STATUS_OK = 200;
const STATUS_CREATED = 201;
const STATUS_ACCEPTED = 202;
const STATUS_NO_CONTENT = 204;
const STATUS_PARTIAL_CONTENT = 206;
const STATUS_NOT_MODIFIED = 304;

/**
 * Effect that performs an XML HTTP request to interact with a server.
 *
 * @example
 *
 * {
 *   xhr: {
 *     url: "/endpoint",
 *     method: "GET",
 *     onSuccess: ["success"]
 *   }
 * }
 */
effector(
  "xhr",
  ({
    url,
    method = "GET",
    responseType = "",
    timeout = 3000,
    headers = {},
    data,
    onSuccess,
    onError,
  }) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.responseType = responseType;
    xhr.timeout = timeout;
    for (let name in headers) {
      xhr.setRequestHeader(name, headers[name]);
    }
    xhr.onload = xhr.onerror = function() {
      switch (this.status) {
        case STATUS_OK:
        case STATUS_CREATED:
        case STATUS_ACCEPTED:
        case STATUS_NO_CONTENT:
        case STATUS_PARTIAL_CONTENT:
        case STATUS_NOT_MODIFIED:
          if (onSuccess) {
            trigger(...onSuccess, this.response);
          }
          break;
        default:
          if (onError) {
            trigger(...onError, {
              status: this.status,
              statusText: this.statusText,
              response: this.response,
            });
          }
      }
    };
    xhr.send(data);
  },
);
