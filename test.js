(function ymapsInit(env, modulesMap) {
  var global = this;

  var ym = {
    ns: {},
    supports: {},
    env: env,
  };

  var PERFORMANCE_SHARE = 0.01;
  ym.performance = (function (deps) {
    var module = { exports: {} },
      exports = module.exports,
      define;
    function require(name) {
      return deps[name];
    }
    var performance = window.performance || Object.create(null);
    var now = performance.now
      ? performance.now.bind(performance)
      : function () {
          return Date.now();
        };
    var getResourceTimings = !performance.getEntriesByType
      ? function () {}
      : function getResourceTimings(url) {
          return performance.getEntriesByType("resource").filter(function (x) {
            return x.name === url;
          })[0];
        };

    var url, dataBase, useSendBeacon, enable;

    var pendingResourceMeasures = {};
    var pendingMeasures = {};

    var RESOURCE_MAP = {
      initjs: "i",
      mapjs: "m",
      combine_s: "cs",
      combine_m: "cm",
      combine_l: "cl",
    };
    var TIMING_MAP = {
      eval: "e",
      duration: "d",
      cached: "c",
      encodedSize: "esz",
      decodedSize: "dsz",
      responseDuration: "res",
      requestDuration: "req",
    };

    var ymPerformance = {
      statistics: {
        combine: {
          total: 0,
          size: 0,
          modules: 0,
        },
      },

      initTimings: {},

      now: now,
      getResourceTimings: function (url) {
        return getResourceTimings(url) || {};
      },

      init: function (options) {
        url = options.url;
        dataBase = "/pid=443/cid=73188/dtype=stred" + options.data;
        useSendBeacon = Boolean(options.useSendBeacon && navigator.sendBeacon);
        enable = options.enable;

        ymPerformance.initTimings = ymPerformance.getResourceTimings(
          options.initUrl,
        );
        ymPerformance.saveResourceTimings("initjs", ymPerformance.initTimings, {
          size: false,
          cached: false,
        });
      },

      /** Saves measure to count it later. Prioritizes non-resources over resources (name starts with @). */
      saveMeasure: function (name, value) {
        if (!enable) {
          return;
        }

        var isResource = /^@/.test(name);
        if (isResource) {
          // Make resources name shorter.
          var parts = name.replace(/^@/, "").split(".");
          name =
            (RESOURCE_MAP[parts[0]] || parts[0]) +
            "." +
            (TIMING_MAP[parts[1]] || parts[1]);
        }

        value = Math.round(value);
        if (!isNaN(value)) {
          var pending = isResource ? pendingResourceMeasures : pendingMeasures;
          pending[name] = pending[name] || [];
          pending[name].push(value);
          enqueueFlush();
        }
      },

      startMeasure: function (name, start) {
        start = typeof start === "undefined" ? now() : start;
        var finished = false;
        return {
          finish: function (end) {
            if (!finished) {
              end = typeof end === "undefined" ? now() : end;
              ymPerformance.saveMeasure(name, end - start);
              finished = true;
            }
          },
        };
      },

      /** Saves all available measures for resource. */
      saveResourceTimings: function (name, filterOrTimings, options) {
        var timings =
          typeof filterOrTimings === "object"
            ? filterOrTimings
            : getResourceTimings(filterOrTimings);
        if (!timings) {
          return;
        }

        options = options || {};
        name = name.replace(/^@?/, "@");

        this.saveMeasure(name + ".duration", timings.duration);

        if (!timings.responseStart) {
          // Timing-Allow-Origin is not working, nothing to measure.
          return;
        }

        var cached = timings.transferSize === 0 ? 1 : 0;
        this.saveMeasure(
          name + ".responseDuration",
          timings.responseEnd - timings.responseStart,
        );
        this.saveMeasure(
          name + ".requestDuration",
          timings.responseStart - timings.requestStart,
        );

        if (options.cached !== false) {
          this.saveMeasure(name + ".cached", cached);
        }

        if (options.size !== false && !cached) {
          this.saveMeasure(
            name + ".encodedSize",
            timings.encodedBodySize / 1024,
          );
          this.saveMeasure(
            name + ".decodedSize",
            timings.decodedBodySize / 1024,
          );
        }
      },
    };

    var BATCH_SIZE = 40;
    var BATCH_TIMEOUT = 5000;
    var nextFlushTimer = null;

    function enqueueFlush() {
      nextFlushTimer = nextFlushTimer || setTimeout(flush, BATCH_TIMEOUT);
    }

    function flush() {
      clearTimeout(nextFlushTimer);
      nextFlushTimer = null;
      var batch = getNextBatch();
      if (!batch) {
        return;
      }

      var data = dataBase + "/vars=" + batch + "/*";
      if (!useSendBeacon || !navigator.sendBeacon(url, data)) {
        var img = new Image();
        var rnd = new Date().getTime() + Math.round(Math.random() * 100);
        img.src = url + "/rnd=" + rnd + data;
      }

      enqueueFlush();
    }

    function getNextBatch() {
      var batch = [];

      // Prioritize non-resource measures over resource measures.
      fillBatch(batch, pendingMeasures);
      fillBatch(batch, pendingResourceMeasures);

      return batch.join(",");
    }

    function fillBatch(batch, measures) {
      for (var key in measures) {
        if (measures.hasOwnProperty(key) && measures[key].length) {
          batch.push(key + "=" + measures[key].shift());
          if (batch.length >= BATCH_SIZE) {
            return;
          }
        }
      }
    }

    window.addEventListener("beforeunload", function () {
      ymPerformance.saveMeasure(
        "combine.total",
        ymPerformance.statistics.combine.total,
      );
      ymPerformance.saveMeasure(
        "combine.modules",
        ymPerformance.statistics.combine.modules,
      );
      ymPerformance.saveMeasure(
        "combine.size",
        ymPerformance.statistics.combine.size / 1024,
      );
      flush();
    });

    module.exports = ymPerformance;

    return module.exports;
  })();

  var initEvalMeasure = ym.performance.startMeasure("@initjs.eval");

  ym.count = (function (deps) {
    var module = { exports: {} },
      exports = module.exports,
      define;
    function require(name) {
      return deps[name];
    }
    // Store counts in queue until real counter is loaded.
    var queue = [];
    function enqueueCount() {
      queue.push(arguments);
    }

    // Add another level of indirection because Sandbox runs modules not with
    // ym itself, but with its clone.
    var countImplementation = null;
    var count = function () {
      (countImplementation || enqueueCount).apply(null, arguments);
    };

    // Replace queue counter with real implementation.
    count.provideImplementation = function (getImplementation) {
      if (countImplementation) {
        throw new Error("ym.count: implementation was already provided.");
      }
      countImplementation = getImplementation(queue);
    };

    module.exports = count;

    return module.exports;
  })();
  ym.vow = ym.ns.vow = (function (deps) {
    var module = { exports: {} },
      exports = module.exports,
      define;
    function require(name) {
      return deps[name];
    }
    /**
     * @module vow
     * @author Filatov Dmitry <dfilatov@yandex-team.ru>
     * @version 0.4.13
     * @license
     * Dual licensed under the MIT and GPL licenses:
     *   * http://www.opensource.org/licenses/mit-license.php
     *   * http://www.gnu.org/licenses/gpl.html
     */

    (function (global) {
      var undef,
        nextTick = (function () {
          var fns = [],
            enqueueFn = function (fn) {
              fns.push(fn);
              return fns.length === 1;
            },
            callFns = function () {
              var fnsToCall = fns,
                i = 0,
                len = fns.length;
              fns = [];
              while (i < len) {
                fnsToCall[i++]();
              }
            };

          if (typeof setImmediate === "function") {
            // ie10, nodejs >= 0.10
            return function (fn) {
              enqueueFn(fn) && setImmediate(callFns);
            };
          }

          if (typeof process === "object" && process.nextTick) {
            // nodejs < 0.10
            return function (fn) {
              enqueueFn(fn) && process.nextTick(callFns);
            };
          }

          var MutationObserver =
            global.MutationObserver || global.WebKitMutationObserver; // modern browsers
          if (MutationObserver) {
            var num = 1,
              node = document.createTextNode("");

            new MutationObserver(callFns).observe(node, {
              characterData: true,
            });

            return function (fn) {
              enqueueFn(fn) && (node.data = num *= -1);
            };
          }

          if (global.postMessage) {
            var isPostMessageAsync = true;
            if (global.attachEvent) {
              var checkAsync = function () {
                isPostMessageAsync = false;
              };
              global.attachEvent("onmessage", checkAsync);
              global.postMessage("__checkAsync", "*");
              global.detachEvent("onmessage", checkAsync);
            }

            if (isPostMessageAsync) {
              var msg = "__promise" + Math.random() + "_" + new Date(),
                onMessage = function (e) {
                  if (e.data === msg) {
                    e.stopPropagation && e.stopPropagation();
                    callFns();
                  }
                };

              global.addEventListener
                ? global.addEventListener("message", onMessage, true)
                : global.attachEvent("onmessage", onMessage);

              return function (fn) {
                enqueueFn(fn) && global.postMessage(msg, "*");
              };
            }
          }

          var doc = global.document;
          if ("onreadystatechange" in doc.createElement("script")) {
            // ie6-ie8
            var createScript = function () {
              var script = doc.createElement("script");
              script.onreadystatechange = function () {
                script.parentNode.removeChild(script);
                script = script.onreadystatechange = null;
                callFns();
              };
              (doc.documentElement || doc.body).appendChild(script);
            };

            return function (fn) {
              enqueueFn(fn) && createScript();
            };
          }

          return function (fn) {
            // old browsers
            enqueueFn(fn) && setTimeout(callFns, 0);
          };
        })(),
        throwException = function (e) {
          nextTick(function () {
            throw e;
          });
        },
        isFunction = function (obj) {
          return typeof obj === "function";
        },
        isObject = function (obj) {
          return obj !== null && typeof obj === "object";
        },
        toStr = Object.prototype.toString,
        isArray =
          Array.isArray ||
          function (obj) {
            return toStr.call(obj) === "[object Array]";
          },
        getArrayKeys = function (arr) {
          var res = [],
            i = 0,
            len = arr.length;
          while (i < len) {
            res.push(i++);
          }
          return res;
        },
        getObjectKeys =
          Object.keys ||
          function (obj) {
            var res = [];
            for (var i in obj) {
              obj.hasOwnProperty(i) && res.push(i);
            }
            return res;
          },
        defineCustomErrorType = function (name) {
          var res = function (message) {
            this.name = name;
            this.message = message;
          };

          res.prototype = new Error();

          return res;
        },
        wrapOnFulfilled = function (onFulfilled, idx) {
          return function (val) {
            onFulfilled.call(this, val, idx);
          };
        };

      /**
       * @class Deferred
       * @exports vow:Deferred
       * @description
       * The `Deferred` class is used to encapsulate newly-created promise object along with functions that resolve, reject or notify it.
       */

      /**
       * @constructor
       * @description
       * You can use `vow.defer()` instead of using this constructor.
       *
       * `new vow.Deferred()` gives the same result as `vow.defer()`.
       */
      var Deferred = function () {
        this._promise = new Promise();
      };

      Deferred.prototype = /** @lends Deferred.prototype */ {
        /**
         * Returns the corresponding promise.
         *
         * @returns {vow:Promise}
         */
        promise: function () {
          return this._promise;
        },

        /**
         * Resolves the corresponding promise with the given `value`.
         *
         * @param {*} value
         *
         * @example
         * ```js
         * var defer = vow.defer(),
         *     promise = defer.promise();
         *
         * promise.then(function(value) {
         *     // value is "'success'" here
         * });
         *
         * defer.resolve('success');
         * ```
         */
        resolve: function (value) {
          this._promise.isResolved() || this._promise._resolve(value);
        },

        /**
         * Rejects the corresponding promise with the given `reason`.
         *
         * @param {*} reason
         *
         * @example
         * ```js
         * var defer = vow.defer(),
         *     promise = defer.promise();
         *
         * promise.fail(function(reason) {
         *     // reason is "'something is wrong'" here
         * });
         *
         * defer.reject('something is wrong');
         * ```
         */
        reject: function (reason) {
          if (this._promise.isResolved()) {
            return;
          }

          if (vow.isPromise(reason)) {
            reason = reason.then(function (val) {
              var defer = vow.defer();
              defer.reject(val);
              return defer.promise();
            });
            this._promise._resolve(reason);
          } else {
            this._promise._reject(reason);
          }
        },

        /**
         * Notifies the corresponding promise with the given `value`.
         *
         * @param {*} value
         *
         * @example
         * ```js
         * var defer = vow.defer(),
         *     promise = defer.promise();
         *
         * promise.progress(function(value) {
         *     // value is "'20%'", "'40%'" here
         * });
         *
         * defer.notify('20%');
         * defer.notify('40%');
         * ```
         */
        notify: function (value) {
          this._promise.isResolved() || this._promise._notify(value);
        },
      };

      var PROMISE_STATUS = {
        PENDING: 0,
        RESOLVED: 1,
        FULFILLED: 2,
        REJECTED: 3,
      };

      /**
       * @class Promise
       * @exports vow:Promise
       * @description
       * The `Promise` class is used when you want to give to the caller something to subscribe to,
       * but not the ability to resolve or reject the deferred.
       */

      /**
       * @constructor
       * @param {Function} resolver See https://github.com/domenic/promises-unwrapping/blob/master/README.md#the-promise-constructor for details.
       * @description
       * You should use this constructor directly only if you are going to use `vow` as DOM Promises implementation.
       * In other case you should use `vow.defer()` and `defer.promise()` methods.
       * @example
       * ```js
       * function fetchJSON(url) {
       *     return new vow.Promise(function(resolve, reject, notify) {
       *         var xhr = new XMLHttpRequest();
       *         xhr.open('GET', url);
       *         xhr.responseType = 'json';
       *         xhr.send();
       *         xhr.onload = function() {
       *             if(xhr.response) {
       *                 resolve(xhr.response);
       *             }
       *             else {
       *                 reject(new TypeError());
       *             }
       *         };
       *     });
       * }
       * ```
       */
      var Promise = function (resolver) {
        this._value = undef;
        this._status = PROMISE_STATUS.PENDING;

        this._fulfilledCallbacks = [];
        this._rejectedCallbacks = [];
        this._progressCallbacks = [];

        if (resolver) {
          // NOTE: see https://github.com/domenic/promises-unwrapping/blob/master/README.md
          var _this = this,
            resolverFnLen = resolver.length;

          resolver(
            function (val) {
              _this.isResolved() || _this._resolve(val);
            },
            resolverFnLen > 1
              ? function (reason) {
                  _this.isResolved() || _this._reject(reason);
                }
              : undef,
            resolverFnLen > 2
              ? function (val) {
                  _this.isResolved() || _this._notify(val);
                }
              : undef,
          );
        }
      };

      Promise.prototype = /** @lends Promise.prototype */ {
        /**
         * Returns the value of the fulfilled promise or the reason in case of rejection.
         *
         * @returns {*}
         */
        valueOf: function () {
          return this._value;
        },

        /**
         * Returns `true` if the promise is resolved.
         *
         * @returns {Boolean}
         */
        isResolved: function () {
          return this._status !== PROMISE_STATUS.PENDING;
        },

        /**
         * Returns `true` if the promise is fulfilled.
         *
         * @returns {Boolean}
         */
        isFulfilled: function () {
          return this._status === PROMISE_STATUS.FULFILLED;
        },

        /**
         * Returns `true` if the promise is rejected.
         *
         * @returns {Boolean}
         */
        isRejected: function () {
          return this._status === PROMISE_STATUS.REJECTED;
        },

        /**
         * Adds reactions to the promise.
         *
         * @param {Function} [onFulfilled] Callback that will be invoked with a provided value after the promise has been fulfilled
         * @param {Function} [onRejected] Callback that will be invoked with a provided reason after the promise has been rejected
         * @param {Function} [onProgress] Callback that will be invoked with a provided value after the promise has been notified
         * @param {Object} [ctx] Context of the callbacks execution
         * @returns {vow:Promise} A new promise, see https://github.com/promises-aplus/promises-spec for details
         */
        then: function (onFulfilled, onRejected, onProgress, ctx) {
          var defer = new Deferred();
          this._addCallbacks(defer, onFulfilled, onRejected, onProgress, ctx);
          return defer.promise();
        },

        /**
         * Adds only a rejection reaction. This method is a shorthand for `promise.then(undefined, onRejected)`.
         *
         * @param {Function} onRejected Callback that will be called with a provided 'reason' as argument after the promise has been rejected
         * @param {Object} [ctx] Context of the callback execution
         * @returns {vow:Promise}
         */
        catch: function (onRejected, ctx) {
          return this.then(undef, onRejected, ctx);
        },

        /**
         * Adds only a rejection reaction. This method is a shorthand for `promise.then(null, onRejected)`. It's also an alias for `catch`.
         *
         * @param {Function} onRejected Callback to be called with the value after promise has been rejected
         * @param {Object} [ctx] Context of the callback execution
         * @returns {vow:Promise}
         */
        fail: function (onRejected, ctx) {
          return this.then(undef, onRejected, ctx);
        },

        /**
         * Adds a resolving reaction (for both fulfillment and rejection).
         *
         * @param {Function} onResolved Callback that will be invoked with the promise as an argument, after the promise has been resolved.
         * @param {Object} [ctx] Context of the callback execution
         * @returns {vow:Promise}
         */
        always: function (onResolved, ctx) {
          var _this = this,
            cb = function () {
              return onResolved.call(this, _this);
            };

          return this.then(cb, cb, ctx);
        },

        /**
         * Adds a progress reaction.
         *
         * @param {Function} onProgress Callback that will be called with a provided value when the promise has been notified
         * @param {Object} [ctx] Context of the callback execution
         * @returns {vow:Promise}
         */
        progress: function (onProgress, ctx) {
          return this.then(undef, undef, onProgress, ctx);
        },

        /**
         * Like `promise.then`, but "spreads" the array into a variadic value handler.
         * It is useful with the `vow.all` and the `vow.allResolved` methods.
         *
         * @param {Function} [onFulfilled] Callback that will be invoked with a provided value after the promise has been fulfilled
         * @param {Function} [onRejected] Callback that will be invoked with a provided reason after the promise has been rejected
         * @param {Object} [ctx] Context of the callbacks execution
         * @returns {vow:Promise}
         *
         * @example
         * ```js
         * var defer1 = vow.defer(),
         *     defer2 = vow.defer();
         *
         * vow.all([defer1.promise(), defer2.promise()]).spread(function(arg1, arg2) {
         *     // arg1 is "1", arg2 is "'two'" here
         * });
         *
         * defer1.resolve(1);
         * defer2.resolve('two');
         * ```
         */
        spread: function (onFulfilled, onRejected, ctx) {
          return this.then(
            function (val) {
              return onFulfilled.apply(this, val);
            },
            onRejected,
            ctx,
          );
        },

        /**
         * Like `then`, but terminates a chain of promises.
         * If the promise has been rejected, this method throws it's "reason" as an exception in a future turn of the event loop.
         *
         * @param {Function} [onFulfilled] Callback that will be invoked with a provided value after the promise has been fulfilled
         * @param {Function} [onRejected] Callback that will be invoked with a provided reason after the promise has been rejected
         * @param {Function} [onProgress] Callback that will be invoked with a provided value after the promise has been notified
         * @param {Object} [ctx] Context of the callbacks execution
         *
         * @example
         * ```js
         * var defer = vow.defer();
         * defer.reject(Error('Internal error'));
         * defer.promise().done(); // exception to be thrown
         * ```
         */
        done: function (onFulfilled, onRejected, onProgress, ctx) {
          this.then(onFulfilled, onRejected, onProgress, ctx).fail(
            throwException,
          );
        },

        /**
         * Returns a new promise that will be fulfilled in `delay` milliseconds if the promise is fulfilled,
         * or immediately rejected if the promise is rejected.
         *
         * @param {Number} delay
         * @returns {vow:Promise}
         */
        delay: function (delay) {
          var timer,
            promise = this.then(function (val) {
              var defer = new Deferred();
              timer = setTimeout(function () {
                defer.resolve(val);
              }, delay);

              return defer.promise();
            });

          promise.always(function () {
            clearTimeout(timer);
          });

          return promise;
        },

        /**
         * Returns a new promise that will be rejected in `timeout` milliseconds
         * if the promise is not resolved beforehand.
         *
         * @param {Number} timeout
         * @returns {vow:Promise}
         *
         * @example
         * ```js
         * var defer = vow.defer(),
         *     promiseWithTimeout1 = defer.promise().timeout(50),
         *     promiseWithTimeout2 = defer.promise().timeout(200);
         *
         * setTimeout(
         *     function() {
         *         defer.resolve('ok');
         *     },
         *     100);
         *
         * promiseWithTimeout1.fail(function(reason) {
         *     // promiseWithTimeout to be rejected in 50ms
         * });
         *
         * promiseWithTimeout2.then(function(value) {
         *     // promiseWithTimeout to be fulfilled with "'ok'" value
         * });
         * ```
         */
        timeout: function (timeout) {
          var defer = new Deferred(),
            timer = setTimeout(function () {
              defer.reject(new vow.TimedOutError("timed out"));
            }, timeout);

          this.then(
            function (val) {
              defer.resolve(val);
            },
            function (reason) {
              defer.reject(reason);
            },
          );

          defer.promise().always(function () {
            clearTimeout(timer);
          });

          return defer.promise();
        },

        _vow: true,

        _resolve: function (val) {
          if (this._status > PROMISE_STATUS.RESOLVED) {
            return;
          }

          if (val === this) {
            this._reject(TypeError("Can't resolve promise with itself"));
            return;
          }

          this._status = PROMISE_STATUS.RESOLVED;

          if (val && !!val._vow) {
            // shortpath for vow.Promise
            val.isFulfilled()
              ? this._fulfill(val.valueOf())
              : val.isRejected()
              ? this._reject(val.valueOf())
              : val.then(this._fulfill, this._reject, this._notify, this);
            return;
          }

          if (isObject(val) || isFunction(val)) {
            var then;
            try {
              then = val.then;
            } catch (e) {
              this._reject(e);
              return;
            }

            if (isFunction(then)) {
              var _this = this,
                isResolved = false;

              try {
                then.call(
                  val,
                  function (val) {
                    if (isResolved) {
                      return;
                    }

                    isResolved = true;
                    _this._resolve(val);
                  },
                  function (err) {
                    if (isResolved) {
                      return;
                    }

                    isResolved = true;
                    _this._reject(err);
                  },
                  function (val) {
                    _this._notify(val);
                  },
                );
              } catch (e) {
                isResolved || this._reject(e);
              }

              return;
            }
          }

          this._fulfill(val);
        },

        _fulfill: function (val) {
          if (this._status > PROMISE_STATUS.RESOLVED) {
            return;
          }

          this._status = PROMISE_STATUS.FULFILLED;
          this._value = val;

          this._callCallbacks(this._fulfilledCallbacks, val);
          this._fulfilledCallbacks = this._rejectedCallbacks = this._progressCallbacks = undef;
        },

        _reject: function (reason) {
          if (this._status > PROMISE_STATUS.RESOLVED) {
            return;
          }

          this._status = PROMISE_STATUS.REJECTED;
          this._value = reason;

          this._callCallbacks(this._rejectedCallbacks, reason);
          this._fulfilledCallbacks = this._rejectedCallbacks = this._progressCallbacks = undef;
        },

        _notify: function (val) {
          this._callCallbacks(this._progressCallbacks, val);
        },

        _addCallbacks: function (
          defer,
          onFulfilled,
          onRejected,
          onProgress,
          ctx,
        ) {
          if (onRejected && !isFunction(onRejected)) {
            ctx = onRejected;
            onRejected = undef;
          } else if (onProgress && !isFunction(onProgress)) {
            ctx = onProgress;
            onProgress = undef;
          }

          var cb;

          if (!this.isRejected()) {
            cb = {
              defer: defer,
              fn: isFunction(onFulfilled) ? onFulfilled : undef,
              ctx: ctx,
            };
            this.isFulfilled()
              ? this._callCallbacks([cb], this._value)
              : this._fulfilledCallbacks.push(cb);
          }

          if (!this.isFulfilled()) {
            cb = { defer: defer, fn: onRejected, ctx: ctx };
            this.isRejected()
              ? this._callCallbacks([cb], this._value)
              : this._rejectedCallbacks.push(cb);
          }

          if (this._status <= PROMISE_STATUS.RESOLVED) {
            this._progressCallbacks.push({
              defer: defer,
              fn: onProgress,
              ctx: ctx,
            });
          }
        },

        _callCallbacks: function (callbacks, arg) {
          var len = callbacks.length;
          if (!len) {
            return;
          }

          var isResolved = this.isResolved(),
            isFulfilled = this.isFulfilled(),
            isRejected = this.isRejected();

          nextTick(function () {
            var i = 0,
              cb,
              defer,
              fn;
            while (i < len) {
              cb = callbacks[i++];
              defer = cb.defer;
              fn = cb.fn;

              if (fn) {
                var ctx = cb.ctx,
                  res;
                try {
                  res = ctx ? fn.call(ctx, arg) : fn(arg);
                } catch (e) {
                  defer.reject(e);
                  continue;
                }

                isResolved ? defer.resolve(res) : defer.notify(res);
              } else if (isFulfilled) {
                defer.resolve(arg);
              } else if (isRejected) {
                defer.reject(arg);
              } else {
                defer.notify(arg);
              }
            }
          });
        },
      };

      /** @lends Promise */
      var staticMethods = {
        /**
         * Coerces the given `value` to a promise, or returns the `value` if it's already a promise.
         *
         * @param {*} value
         * @returns {vow:Promise}
         */
        cast: function (value) {
          return vow.cast(value);
        },

        /**
         * Returns a promise, that will be fulfilled only after all the items in `iterable` are fulfilled.
         * If any of the `iterable` items gets rejected, then the returned promise will be rejected.
         *
         * @param {Array|Object} iterable
         * @returns {vow:Promise}
         */
        all: function (iterable) {
          return vow.all(iterable);
        },

        /**
         * Returns a promise, that will be fulfilled only when any of the items in `iterable` are fulfilled.
         * If any of the `iterable` items gets rejected, then the returned promise will be rejected.
         *
         * @param {Array} iterable
         * @returns {vow:Promise}
         */
        race: function (iterable) {
          return vow.anyResolved(iterable);
        },

        /**
         * Returns a promise that has already been resolved with the given `value`.
         * If `value` is a promise, the returned promise will have `value`'s state.
         *
         * @param {*} value
         * @returns {vow:Promise}
         */
        resolve: function (value) {
          return vow.resolve(value);
        },

        /**
         * Returns a promise that has already been rejected with the given `reason`.
         *
         * @param {*} reason
         * @returns {vow:Promise}
         */
        reject: function (reason) {
          return vow.reject(reason);
        },
      };

      for (var prop in staticMethods) {
        staticMethods.hasOwnProperty(prop) &&
          (Promise[prop] = staticMethods[prop]);
      }

      var vow = /** @exports vow */ {
        Deferred: Deferred,

        Promise: Promise,

        /**
         * Creates a new deferred. This method is a factory method for `vow:Deferred` class.
         * It's equivalent to `new vow.Deferred()`.
         *
         * @returns {vow:Deferred}
         */
        defer: function () {
          return new Deferred();
        },

        /**
         * Static equivalent to `promise.then`.
         * If `value` is not a promise, then `value` is treated as a fulfilled promise.
         *
         * @param {*} value
         * @param {Function} [onFulfilled] Callback that will be invoked with a provided value after the promise has been fulfilled
         * @param {Function} [onRejected] Callback that will be invoked with a provided reason after the promise has been rejected
         * @param {Function} [onProgress] Callback that will be invoked with a provided value after the promise has been notified
         * @param {Object} [ctx] Context of the callbacks execution
         * @returns {vow:Promise}
         */
        when: function (value, onFulfilled, onRejected, onProgress, ctx) {
          return vow.cast(value).then(onFulfilled, onRejected, onProgress, ctx);
        },

        /**
         * Static equivalent to `promise.fail`.
         * If `value` is not a promise, then `value` is treated as a fulfilled promise.
         *
         * @param {*} value
         * @param {Function} onRejected Callback that will be invoked with a provided reason after the promise has been rejected
         * @param {Object} [ctx] Context of the callback execution
         * @returns {vow:Promise}
         */
        fail: function (value, onRejected, ctx) {
          return vow.when(value, undef, onRejected, ctx);
        },

        /**
         * Static equivalent to `promise.always`.
         * If `value` is not a promise, then `value` is treated as a fulfilled promise.
         *
         * @param {*} value
         * @param {Function} onResolved Callback that will be invoked with the promise as an argument, after the promise has been resolved.
         * @param {Object} [ctx] Context of the callback execution
         * @returns {vow:Promise}
         */
        always: function (value, onResolved, ctx) {
          return vow.when(value).always(onResolved, ctx);
        },

        /**
         * Static equivalent to `promise.progress`.
         * If `value` is not a promise, then `value` is treated as a fulfilled promise.
         *
         * @param {*} value
         * @param {Function} onProgress Callback that will be invoked with a provided value after the promise has been notified
         * @param {Object} [ctx] Context of the callback execution
         * @returns {vow:Promise}
         */
        progress: function (value, onProgress, ctx) {
          return vow.when(value).progress(onProgress, ctx);
        },

        /**
         * Static equivalent to `promise.spread`.
         * If `value` is not a promise, then `value` is treated as a fulfilled promise.
         *
         * @param {*} value
         * @param {Function} [onFulfilled] Callback that will be invoked with a provided value after the promise has been fulfilled
         * @param {Function} [onRejected] Callback that will be invoked with a provided reason after the promise has been rejected
         * @param {Object} [ctx] Context of the callbacks execution
         * @returns {vow:Promise}
         */
        spread: function (value, onFulfilled, onRejected, ctx) {
          return vow.when(value).spread(onFulfilled, onRejected, ctx);
        },

        /**
         * Static equivalent to `promise.done`.
         * If `value` is not a promise, then `value` is treated as a fulfilled promise.
         *
         * @param {*} value
         * @param {Function} [onFulfilled] Callback that will be invoked with a provided value after the promise has been fulfilled
         * @param {Function} [onRejected] Callback that will be invoked with a provided reason after the promise has been rejected
         * @param {Function} [onProgress] Callback that will be invoked with a provided value after the promise has been notified
         * @param {Object} [ctx] Context of the callbacks execution
         */
        done: function (value, onFulfilled, onRejected, onProgress, ctx) {
          vow.when(value).done(onFulfilled, onRejected, onProgress, ctx);
        },

        /**
         * Checks whether the given `value` is a promise-like object
         *
         * @param {*} value
         * @returns {Boolean}
         *
         * @example
         * ```js
         * vow.isPromise('something'); // returns false
         * vow.isPromise(vow.defer().promise()); // returns true
         * vow.isPromise({ then : function() { }); // returns true
         * ```
         */
        isPromise: function (value) {
          return isObject(value) && isFunction(value.then);
        },

        /**
         * Coerces the given `value` to a promise, or returns the `value` if it's already a promise.
         *
         * @param {*} value
         * @returns {vow:Promise}
         */
        cast: function (value) {
          return value && !!value._vow ? value : vow.resolve(value);
        },

        /**
         * Static equivalent to `promise.valueOf`.
         * If `value` is not a promise, then `value` is treated as a fulfilled promise.
         *
         * @param {*} value
         * @returns {*}
         */
        valueOf: function (value) {
          return value && isFunction(value.valueOf) ? value.valueOf() : value;
        },

        /**
         * Static equivalent to `promise.isFulfilled`.
         * If `value` is not a promise, then `value` is treated as a fulfilled promise.
         *
         * @param {*} value
         * @returns {Boolean}
         */
        isFulfilled: function (value) {
          return value && isFunction(value.isFulfilled)
            ? value.isFulfilled()
            : true;
        },

        /**
         * Static equivalent to `promise.isRejected`.
         * If `value` is not a promise, then `value` is treated as a fulfilled promise.
         *
         * @param {*} value
         * @returns {Boolean}
         */
        isRejected: function (value) {
          return value && isFunction(value.isRejected)
            ? value.isRejected()
            : false;
        },

        /**
         * Static equivalent to `promise.isResolved`.
         * If `value` is not a promise, then `value` is treated as a fulfilled promise.
         *
         * @param {*} value
         * @returns {Boolean}
         */
        isResolved: function (value) {
          return value && isFunction(value.isResolved)
            ? value.isResolved()
            : true;
        },

        /**
         * Returns a promise that has already been resolved with the given `value`.
         * If `value` is a promise, the returned promise will have `value`'s state.
         *
         * @param {*} value
         * @returns {vow:Promise}
         */
        resolve: function (value) {
          var res = vow.defer();
          res.resolve(value);
          return res.promise();
        },

        /**
         * Returns a promise that has already been fulfilled with the given `value`.
         * If `value` is a promise, the returned promise will be fulfilled with the fulfill/rejection value of `value`.
         *
         * @param {*} value
         * @returns {vow:Promise}
         */
        fulfill: function (value) {
          var defer = vow.defer(),
            promise = defer.promise();

          defer.resolve(value);

          return promise.isFulfilled()
            ? promise
            : promise.then(null, function (reason) {
                return reason;
              });
        },

        /**
         * Returns a promise that has already been rejected with the given `reason`.
         * If `reason` is a promise, the returned promise will be rejected with the fulfill/rejection value of `reason`.
         *
         * @param {*} reason
         * @returns {vow:Promise}
         */
        reject: function (reason) {
          var defer = vow.defer();
          defer.reject(reason);
          return defer.promise();
        },

        /**
         * Invokes the given function `fn` with arguments `args`
         *
         * @param {Function} fn
         * @param {...*} [args]
         * @returns {vow:Promise}
         *
         * @example
         * ```js
         * var promise1 = vow.invoke(function(value) {
         *         return value;
         *     }, 'ok'),
         *     promise2 = vow.invoke(function() {
         *         throw Error();
         *     });
         *
         * promise1.isFulfilled(); // true
         * promise1.valueOf(); // 'ok'
         * promise2.isRejected(); // true
         * promise2.valueOf(); // instance of Error
         * ```
         */
        invoke: function (fn, args) {
          var len = Math.max(arguments.length - 1, 0),
            callArgs;
          if (len) {
            // optimization for V8
            callArgs = Array(len);
            var i = 0;
            while (i < len) {
              callArgs[i++] = arguments[i];
            }
          }

          try {
            return vow.resolve(
              callArgs ? fn.apply(global, callArgs) : fn.call(global),
            );
          } catch (e) {
            return vow.reject(e);
          }
        },

        /**
         * Returns a promise, that will be fulfilled only after all the items in `iterable` are fulfilled.
         * If any of the `iterable` items gets rejected, the promise will be rejected.
         *
         * @param {Array|Object} iterable
         * @returns {vow:Promise}
         *
         * @example
         * with array:
         * ```js
         * var defer1 = vow.defer(),
         *     defer2 = vow.defer();
         *
         * vow.all([defer1.promise(), defer2.promise(), 3])
         *     .then(function(value) {
         *          // value is "[1, 2, 3]" here
         *     });
         *
         * defer1.resolve(1);
         * defer2.resolve(2);
         * ```
         *
         * @example
         * with object:
         * ```js
         * var defer1 = vow.defer(),
         *     defer2 = vow.defer();
         *
         * vow.all({ p1 : defer1.promise(), p2 : defer2.promise(), p3 : 3 })
         *     .then(function(value) {
         *          // value is "{ p1 : 1, p2 : 2, p3 : 3 }" here
         *     });
         *
         * defer1.resolve(1);
         * defer2.resolve(2);
         * ```
         */
        all: function (iterable) {
          var defer = new Deferred(),
            isPromisesArray = isArray(iterable),
            keys = isPromisesArray
              ? getArrayKeys(iterable)
              : getObjectKeys(iterable),
            len = keys.length,
            res = isPromisesArray ? [] : {};

          if (!len) {
            defer.resolve(res);
            return defer.promise();
          }

          var i = len;
          vow._forEach(
            iterable,
            function (value, idx) {
              res[keys[idx]] = value;
              if (!--i) {
                defer.resolve(res);
              }
            },
            defer.reject,
            defer.notify,
            defer,
            keys,
          );

          return defer.promise();
        },

        /**
         * Returns a promise, that will be fulfilled only after all the items in `iterable` are resolved.
         *
         * @param {Array|Object} iterable
         * @returns {vow:Promise}
         *
         * @example
         * ```js
         * var defer1 = vow.defer(),
         *     defer2 = vow.defer();
         *
         * vow.allResolved([defer1.promise(), defer2.promise()]).spread(function(promise1, promise2) {
         *     promise1.isRejected(); // returns true
         *     promise1.valueOf(); // returns "'error'"
         *     promise2.isFulfilled(); // returns true
         *     promise2.valueOf(); // returns "'ok'"
         * });
         *
         * defer1.reject('error');
         * defer2.resolve('ok');
         * ```
         */
        allResolved: function (iterable) {
          var defer = new Deferred(),
            isPromisesArray = isArray(iterable),
            keys = isPromisesArray
              ? getArrayKeys(iterable)
              : getObjectKeys(iterable),
            i = keys.length,
            res = isPromisesArray ? [] : {};

          if (!i) {
            defer.resolve(res);
            return defer.promise();
          }

          var onResolved = function () {
            --i || defer.resolve(iterable);
          };

          vow._forEach(
            iterable,
            onResolved,
            onResolved,
            defer.notify,
            defer,
            keys,
          );

          return defer.promise();
        },

        allPatiently: function (iterable) {
          return vow.allResolved(iterable).then(function () {
            var isPromisesArray = isArray(iterable),
              keys = isPromisesArray
                ? getArrayKeys(iterable)
                : getObjectKeys(iterable),
              rejectedPromises,
              fulfilledPromises,
              len = keys.length,
              i = 0,
              key,
              promise;

            if (!len) {
              return isPromisesArray ? [] : {};
            }

            while (i < len) {
              key = keys[i++];
              promise = iterable[key];
              if (vow.isRejected(promise)) {
                rejectedPromises ||
                  (rejectedPromises = isPromisesArray ? [] : {});
                isPromisesArray
                  ? rejectedPromises.push(promise.valueOf())
                  : (rejectedPromises[key] = promise.valueOf());
              } else if (!rejectedPromises) {
                (fulfilledPromises ||
                  (fulfilledPromises = isPromisesArray ? [] : {}))[
                  key
                ] = vow.valueOf(promise);
              }
            }

            if (rejectedPromises) {
              throw rejectedPromises;
            }

            return fulfilledPromises;
          });
        },

        /**
         * Returns a promise, that will be fulfilled if any of the items in `iterable` is fulfilled.
         * If all of the `iterable` items get rejected, the promise will be rejected (with the reason of the first rejected item).
         *
         * @param {Array} iterable
         * @returns {vow:Promise}
         */
        any: function (iterable) {
          var defer = new Deferred(),
            len = iterable.length;

          if (!len) {
            defer.reject(Error());
            return defer.promise();
          }

          var i = 0,
            reason;
          vow._forEach(
            iterable,
            defer.resolve,
            function (e) {
              i || (reason = e);
              ++i === len && defer.reject(reason);
            },
            defer.notify,
            defer,
          );

          return defer.promise();
        },

        /**
         * Returns a promise, that will be fulfilled only when any of the items in `iterable` is fulfilled.
         * If any of the `iterable` items gets rejected, the promise will be rejected.
         *
         * @param {Array} iterable
         * @returns {vow:Promise}
         */
        anyResolved: function (iterable) {
          var defer = new Deferred(),
            len = iterable.length;

          if (!len) {
            defer.reject(Error());
            return defer.promise();
          }

          vow._forEach(
            iterable,
            defer.resolve,
            defer.reject,
            defer.notify,
            defer,
          );

          return defer.promise();
        },

        /**
         * Static equivalent to `promise.delay`.
         * If `value` is not a promise, then `value` is treated as a fulfilled promise.
         *
         * @param {*} value
         * @param {Number} delay
         * @returns {vow:Promise}
         */
        delay: function (value, delay) {
          return vow.resolve(value).delay(delay);
        },

        /**
         * Static equivalent to `promise.timeout`.
         * If `value` is not a promise, then `value` is treated as a fulfilled promise.
         *
         * @param {*} value
         * @param {Number} timeout
         * @returns {vow:Promise}
         */
        timeout: function (value, timeout) {
          return vow.resolve(value).timeout(timeout);
        },

        _forEach: function (
          promises,
          onFulfilled,
          onRejected,
          onProgress,
          ctx,
          keys,
        ) {
          var len = keys ? keys.length : promises.length,
            i = 0;

          while (i < len) {
            vow.when(
              promises[keys ? keys[i] : i],
              wrapOnFulfilled(onFulfilled, i),
              onRejected,
              onProgress,
              ctx,
            );
            ++i;
          }
        },

        TimedOutError: defineCustomErrorType("TimedOut"),
      };

      vow.__nextTick__ = nextTick;

      var defineAsGlobal = true;
      if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = vow;
        defineAsGlobal = false;
      }

      if (typeof modules === "object" && isFunction(modules.define)) {
        modules.define("vow", function (provide) {
          provide(vow);
        });
        defineAsGlobal = false;
      }

      if (typeof define === "function") {
        define(function (require, exports, module) {
          module.exports = vow;
        });
        defineAsGlobal = false;
      }

      defineAsGlobal && (global.vow = vow);
    })(typeof window !== "undefined" ? window : global);

    return module.exports;
  })();
  ym.utils = (function (deps) {
    var module = { exports: {} },
      exports = module.exports,
      define;
    function require(name) {
      return deps[name];
    }
    var vow = require("vow");
    var hop = Object.prototype.hasOwnProperty;

    exports.nextTick = vow.__nextTick__;
    vow.__nextTick__ = undefined;

    exports.isArray = Array.isArray
      ? Array.isArray
      : function (obj) {
          return Object.prototype.toString.call(obj) === "[object Array]";
        };

    exports.extend = Object.assign
      ? Object.assign
      : function objectAssign(target) {
          for (var i = 1, l = arguments.length; i < l; i++) {
            var object = arguments[i];
            if (object == null) {
              continue;
            }

            for (var key in object) {
              if (hop.call(object, key)) {
                target[key] = object[key];
              }
            }
          }

          return target;
        };

    exports.setDeep = function (target, path, value) {
      var parts = path.split(".");
      for (var i = 0; i < parts.length - 1; i++) {
        var part = parts[i];
        target[part] = target[part] || {};
        target = target[part];
      }

      var name = parts[parts.length - 1];
      target[name] = value;
    };

    exports.createPackage = function (depends, imports, expandWhenRegistered) {
      var result = exports.registerImports({}, depends, imports);
      if (expandWhenRegistered) {
        result.__expand = { depends: depends, imports: imports };
      }

      return result;
    };

    exports.registerImports = function (target, depends, imports) {
      for (var i = 0; i < depends.length; i++) {
        if (imports[i].__expand) {
          exports.registerImports(
            target,
            imports[i].__expand.depends,
            imports[i].__expand.imports,
          );
        } else {
          exports.setDeep(target, depends[i], imports[i]);
        }
      }

      return target;
    };

    return module.exports;
  })({ vow: ym.vow });

  (function () {
    var testDiv;
    var transitableProperties = {
      transform: "transform",
      opacity: "opacity",
      transitionTimingFunction: "transition-timing-function",
      //TODO - нет никакой реакции на эти значения
      userSelect: "user-select",
      height: "height",
    };
    var transitionPropertiesCache = {};
    var cssPropertiesCache = {};
    var browserPrefix = ym.env.browser.cssPrefix.toLowerCase();

    function checkCssProperty(name) {
      /* eslint-disable no-return-assign */
      return typeof cssPropertiesCache[name] == "undefined"
        ? (cssPropertiesCache[name] = checkDivStyle(name))
        : cssPropertiesCache[name];
    }

    function checkDivStyle(name) {
      return (
        checkTestDiv(name) || //names
        checkTestDiv(browserPrefix + upperCaseFirst(name)) || //mozNames
        checkTestDiv(ym.env.browser.cssPrefix + upperCaseFirst(name))
      ); //MozNames
    }

    function checkTestDiv(name) {
      return typeof getTestDiv().style[name] != "undefined" ? name : null;
    }

    function getTestDiv() {
      return testDiv || (testDiv = document.createElement("div"));
    }

    function upperCaseFirst(str) {
      return str ? str.substr(0, 1).toUpperCase() + str.substr(1) : str;
    }

    function checkCssTransitionProperty(name) {
      var cssProperty = checkCssProperty(name);
      if (cssProperty && cssProperty != name) {
        cssProperty = "-" + browserPrefix + "-" + name;
      }
      return cssProperty;
    }

    function checkTransitionAvailability(name) {
      if (
        transitableProperties[name] &&
        checkCssProperty("transitionProperty")
      ) {
        return checkCssTransitionProperty(transitableProperties[name]);
      }
      return null;
    }

    ym.supports.css = {
      checkProperty: checkCssProperty,

      checkTransitionProperty: function (name) {
        /* eslint-disable no-return-assign */
        return typeof transitionPropertiesCache[name] == "undefined"
          ? (transitionPropertiesCache[name] = checkTransitionAvailability(
              name,
            ))
          : transitionPropertiesCache[name];
      },

      checkTransitionAvailability: checkTransitionAvailability,
    };
  })();
  ym.supports.csp = {
    isSupported: typeof Blob != "undefined" && typeof URL != "undefined",
    isNonceSupported:
      ym.env.browser.name && ym.env.browser.version
        ? !(
            ym.env.browser.name.search("Safari") != -1 &&
            parseInt(ym.env.browser.version) < 10
          )
        : null,
  };
  (function () {
    var webGlContextSettings = {
      failIfMajorPerformanceCaveat: true, // just to be sure
      antialias: false, // Firefox does not like offscreen canvas with AA
    };
    var tests = {};

    function isWebGlCapable() {
      // Test system support
      if (window.WebGLRenderingContext) {
        // test blacklists
        /* eslint-disable quote-props */
        var webglBrowserBlacklist = {
          "Samsung Internet": true, // unstable
          AndroidBrowser: true, // unstable
        };
        var isOldAndroid =
          ym.env.browser.engine == "Webkit" &&
          +ym.env.browser.engineVersion < +537; // unstable

        if (isOldAndroid || webglBrowserBlacklist[ym.env.browser.name]) {
          return false;
        }
      } else {
        // No system support
        return false;
      }
      return true;
    }

    function detectWebGl() {
      if (!isWebGlCapable()) {
        return null;
      }

      var contextName, context;
      try {
        var canvas = document.createElement("canvas");
        context = canvas.getContext(
          (contextName = "webgl"),
          webGlContextSettings,
        );
        if (!context) {
          context = canvas.getContext(
            (contextName = "experimental-webgl"),
            webGlContextSettings,
          ); // IE
          if (!context) {
            contextName = null;
          }
        }
      } catch (e) {
        // suppress warnings at FF
        contextName = null;
      }

      return contextName
        ? { contextName: contextName, context: context }
        : null;
    }

    // Test globalCompositeOperation to work properly
    function testCanvas(sandbox, ctx) {
      sandbox.width = 226;
      sandbox.height = 256;

      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, 150, 150);

      ctx.globalCompositeOperation = "xor";

      ctx.fillStyle = "#f00";
      ctx.fillRect(10, 10, 100, 100);

      ctx.fillStyle = "#0f0";
      ctx.fillRect(50, 50, 100, 100);

      var data = ctx.getImageData(49, 49, 2, 2),
        test = [];
      for (var i = 0; i < 16; i++) {
        test.push(data.data[i]);
      }
      return test.join("x") == "0x0x0x0x0x0x0x0x0x0x0x0x0x255x0x255";
    }

    ym.supports.graphics = {
      hasSvg: function () {
        if (!("svg" in tests)) {
          tests.svg =
            document.implementation &&
            document.implementation.hasFeature(
              "http://www.w3.org/TR/SVG11/feature#BasicStructure",
              "1.1",
            );
        }
        return tests.svg;
      },

      hasCanvas: function () {
        if (!("canvas" in tests)) {
          var sandbox = document.createElement("canvas"),
            canvas = "getContext" in sandbox ? sandbox.getContext("2d") : null;
          tests.canvas = canvas ? testCanvas(sandbox, canvas) : false;
        }
        return tests.canvas;
      },

      hasWebGl: function () {
        if (!("webgl" in tests)) {
          tests.webgl = detectWebGl();
        }
        return tests.webgl;
      },

      redetect: function () {
        tests = {};
      },

      getWebGlContextName: function () {
        return tests.webgl && tests.webgl.contextName;
      },
    };
  })();
  (function () {
    var isCompatibleBrowser;
    ym.supports.vector = {
      isSupported: function isSupported() {
        if (isCompatibleBrowser === undefined) {
          isCompatibleBrowser = detectFeatures();
        }

        return isCompatibleBrowser;
      },
    };

    function detectFeatures() {
      // We need to do all checks to collect full statistics.
      // That's why we don't return 'false' after the first fail.
      // MAPSAPI-13769

      var result = true;

      if (
        ym.env.browser.osFamily == "MacOS" &&
        /^10\.[0-8](\.|$)/.test(ym.env.browser.osVersion)
      ) {
        // Disable vector for old MacOSes. See MAPSAPI-14050
        result = false;
        countReasonsVectorNotSupported("OldMac");
      }

      var fieldsToCheck = [
        "requestAnimationFrame",
        "Worker",
        "URL",
        "Blob",
        "XMLHttpRequest",
        "Set",
        "Map",
        "WebAssembly",
      ];
      fieldsToCheck.forEach(function (field) {
        if (!window[field]) {
          result = false;
          countReasonsVectorNotSupported(field);
        }
      });

      if (typeof Math.trunc !== "function") {
        result = false;
        countReasonsVectorNotSupported("MathTrunc");
      }

      var webGlData = ym.supports.graphics.hasWebGl();
      if (!webGlData || webGlData.contextName !== "webgl") {
        countReasonsVectorNotSupported("hasWebGl");
        // If we can't use webgl context, we can't perform other checks.
        return false;
      }

      var glContext = webGlData.context;
      if (
        glContext.getParameter(glContext.MAX_VERTEX_TEXTURE_IMAGE_UNITS) == 0
      ) {
        result = false;
        countReasonsVectorNotSupported("MAX_VERTEX_TEXTURE_IMAGE_UNITS");
      }

      if (!glContext.getExtension("OES_vertex_array_object")) {
        result = false;
        countReasonsVectorNotSupported("OES_vertex_array_object");
      }

      if (!glContext.getExtension("OES_standard_derivatives")) {
        result = false;
        countReasonsVectorNotSupported("OES_standard_derivatives");
      }

      var fragmentHighPrecision = glContext.getShaderPrecisionFormat(
        glContext.FRAGMENT_SHADER,
        glContext.HIGH_FLOAT,
      );
      if (!fragmentHighPrecision || fragmentHighPrecision.precision == 0) {
        result = false;
        countReasonsVectorNotSupported("highp");
      }

      if (!testPoints()) {
        var debugInfo = getRendererDebugInfo();
        result = false;
        ym.count("error", {
          path: [
            "vectorEngine.drawPointsError",
            ym.env.browser.platform,
            ym.env.browser.name,
            debugInfo.vendor,
            debugInfo.renderer,
          ].join("."),
          share: 1,
        });
      }

      return result;
    }

    function countReasonsVectorNotSupported(errorType) {
      var debugInfo = getRendererDebugInfo();
      ym.count("error", {
        path: [
          "vectorEngine.reasonsVectorNotSupported",
          errorType,
          ym.env.browser.platform,
          ym.env.browser.name,
          debugInfo.vendor,
          debugInfo.renderer,
        ].join("."),
        share: 0.1,
      });
    }

    // MAPSAPI-13729
    function testPoints() {
      var canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      var gl = canvas.getContext("webgl", {
        alpha: false,
        depth: false,
        antialias: false,
      });

      var vShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(
        vShader,
        "#version 100\n" +
          "attribute vec2 p;\n" +
          "void main() {\n" +
          "    gl_Position = vec4(p,0,1);\n" +
          "    gl_PointSize = 1.0;\n" +
          "}",
      );
      gl.compileShader(vShader);
      var fShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(
        fShader,
        "#version 100\n" +
          "void main() {\n" +
          "    gl_FragColor = vec4(1, 0, 0, 1);\n" +
          "}",
      );
      gl.compileShader(fShader);
      var program = gl.createProgram();
      gl.attachShader(program, vShader);
      gl.attachShader(program, fShader);
      gl.bindAttribLocation(program, 0, "p");
      gl.linkProgram(program);
      var vb = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vb);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.clearColor(0, 1, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.drawArrays(gl.POINTS, 0, 1);
      var data = new Uint8Array(4);
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
      return data[0] === 255;
    }

    function getRendererDebugInfo() {
      var result = {};
      var webGlData = ym.supports.graphics.hasWebGl();
      if (!webGlData) {
        return result;
      }
      var glContext = webGlData.context;
      var debugInfo = glContext.getExtension("WEBGL_debug_renderer_info");

      if (debugInfo) {
        result.vendor = glContext
          .getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
          .replace(/\W/g, "_");
        result.renderer = glContext
          .getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
          .replace(/\W/g, "_");
      }

      return result;
    }
  })();
  ym.supports.printPatchNeeded = !ym.supports.css.checkProperty(
    "printColorAdjust",
  );

  ym.logger = (function (deps) {
    var module = { exports: {} },
      exports = module.exports,
      define;
    function require(name) {
      return deps[name];
    }
    var moduleName = "Yandex Maps JS API";

    function getMessage(moduleName, _arg) {
      var str = "";

      if (ym.env.debug) {
        str += "(" + moduleName + "): ";
      }

      str += _arg;
      return str;
    }

    module.exports = {
      assert: function (condition, _arg) {
        if (!condition) {
          if (ym.env.debug) {
            console.log(getMessage(moduleName, _arg));
          }
        }
      },

      log: function (_arg) {
        if (ym.env.debug) {
          console.log(getMessage(moduleName, _arg));
        }
      },

      notice: function (_arg) {
        if (ym.env.debug) {
          console.info(getMessage(moduleName, _arg));
        }
      },

      warning: function (_arg) {
        if (ym.env.debug) {
          console.warn(getMessage(moduleName, _arg));
        }
      },

      error: function (_arg) {
        console.error(getMessage(moduleName, _arg));
      },

      exception: function (moduleName, _arg) {
        throw new Error(getMessage(moduleName, _arg));
      },
    };

    return module.exports;
  })();

  (function () {
    var browser = ym.env.browser;

    browser.documentMode = document.documentMode;

    // Этот флаг, к сожалению, приходится постоянно использовать.
    browser.isIE = browser.name == "MSIE" || browser.name == "IEMobile";

    browser.isEdge = browser.engine == "Edge";

    browser.isChromium =
      browser.base && browser.base.toLocaleLowerCase() == "chromium";

    browser.isSafari = browser.name == "Safari";

    // Настройка маппинга.
    var isPointerBrowser =
      browser.engine == "Edge" ||
      (browser.name == "MSIE" && browser.osVersion > 6.1) ||
      (browser.name == "IEMobile" && browser.engineVersion >= 6);
    if (isPointerBrowser) {
      browser.eventMapper = "pointer";
    } else {
      browser.eventMapper = "touchMouse";
    }

    // В этой сборке Android Browser были был сломал transition - что-то с субпикселями.
    browser.androidBrokenBuild =
      browser.name == "AndroidBrowser" && browser.engineVersion == "534.30";

    var pixelRatio =
      window.devicePixelRatio ||
      (screen.deviceXDPI && screen.deviceXDPI / 96) ||
      1;

    if (
      // В IE11 сломалась canvas графика.
      browser.name == "MSIE" ||
      browser.name == "IEMobile" ||
      (browser.osFamily == "Android" && browser.engine == "Gecko") ||
      (pixelRatio > 1 && pixelRatio < 2) // scale 125%
    ) {
      browser.graphicsRenderEngine = "svg";
    } else {
      browser.graphicsRenderEngine = "canvas";
    }

    // Флаг поддержки transition для свойства transform.
    browser.transformTransition =
      browser.osFamily == "Android" ||
      browser.osFamily == "iOS" ||
      browser.name == "MSIE" ||
      // FF > 41 не синхронизирует транзишены
      // (browser.engine && browser.engine.toLocaleLowerCase() == 'gecko') ||
      browser.isChromium;

    /* Флаг, показывающий наличие в браузере нормально работающей поддержки CSS 3D transforms.
     * В данный момент 3d-преобразования поддерживают webkit-ы, кроме андроидного 2.x (Bada поддерживает).
     *      FF (Gecko) научился 3d с 10-й версии (https://developer.mozilla.org/en/CSS/-moz-transform#Browser_compatibility)
     */
    browser.css3DTransform =
      (browser.engine == "WebKit" &&
        !(
          browser.osFamily == "Android" && parseFloat(browser.osVersion) < 3
        )) ||
      (browser.engine == "Gecko" &&
        parseInt(browser.engineVersion.split(".")[0]) >= 10);

    browser.unsupported = browser.name == "OperaMini";
  })();
  var jsonp = (function (deps) {
    var module = { exports: {} },
      exports = module.exports,
      define;
    function require(name) {
      return deps[name];
    }
    var vow = require("vow");

    module.exports = function jsonp(url, callback) {
      var script = document.createElement("script");
      var deferred = vow.defer();

      if (ym.env.type == "production") {
        script.crossOrigin = "anonymous";
      }

      window[callback] = function (data) {
        delete window[callback];
        script.parentElement.removeChild(script);
        deferred.resolve(data);
      };

      script.src = url;
      document.head.appendChild(script);

      return deferred.promise();
    };

    return module.exports;
  })({ vow: ym.vow });
  var JSONP_PREFIX = "__jsonp_" + (ym.env.namespace || "ymaps" + Date.now());

  var ModuleSystem = (function (deps) {
    var module = { exports: {} },
      exports = module.exports,
      define;
    function require(name) {
      return deps[name];
    }
    var vow = require("vow");
    var utils = require("./ym.utils");

    var hop = Object.prototype.hasOwnProperty;

    var MISSING_DYNAMIC_VALUE = {};

    // Empty array sentinel to reduce the number of empty arrays.
    var EMPTY_ARRAY = Object.freeze([]);

    var STATE = {
      MENTIONED: 1, // Mentioned in map.
      QUEUED: 2, // Queued to load via combine.
      FETCHING: 3, // Currently being fetched via combine.
      DECLARED: 4, // Declared (ym.modules.define was called).
      RESOLVING: 5, // Was required explicitly or as dependency and resolving now.
      ERROR: 6, // Something went wrong.
      DEFINED: 7, // Module is fully defined and already provided its exports.
    };

    module.exports = ModuleSystem;

    function ModuleSystem(config) {
      this._config = config;

      // Sandbox for modules fetched via combine.
      this._sandbox = null;

      // Fast module access. Using ES6 Map doesn't speed up anything.
      this._definitionsByName = Object.create(null);
      this._definitionsByStorage = Object.create(
        null,
      ); /* storage: { key: definition } */
      this._definitionsByAlias = Object.create(null);

      // Currently working on these modules.
      this._queuedForFetching = Object.create(null);

      // Load map immediately after receiving permission to load it.
      this._remoteLoadingAllowed = vow.defer();
      this._initialized = this._remoteLoadingAllowed
        .promise()
        .then(function () {
          if (this._config.useBundles) {
            return this._loadBundle(this._config.initialBudleName);
          } else {
            return this._loadModulesMap();
          }
        }, this)
        .catch(function (err) {
          console.error("Unable to load modules.");
          console.error(err);
          throw err;
        }, this);
    }

    function Definition(
      state,
      name,
      storage,
      key,
      depends,
      declaration,
      context,
      dynamicDepends,
      exports,
    ) {
      // This is a little ugly to use, but makes it easier to track definitions in DevTools.
      // Zero profit from performance point of view.

      this.state = state;

      this.alias = null;
      this.name = name;
      this.storage = storage;
      this.key = key;

      this.depends = depends;
      this.dynamicDepends = dynamicDepends;

      this.declaration = declaration;
      this.context = context;

      this.exports = state === STATE.DEFINED ? exports : undefined;

      // Created lazily when needed.
      this.resolvingPromise = undefined;
      this.fetchingDeferred = undefined;
    }

    ModuleSystem.prototype.allowRemoteLoading = function () {
      this._remoteLoadingAllowed.resolve();
    };

    ModuleSystem.prototype.isDefined = function (name) {
      return Boolean(this._findDefinition(name));
    };

    ModuleSystem.prototype.preload = function (module) {
      return module;
    };

    ModuleSystem.prototype.define = function (
      name,
      depends,
      declaration,
      context,
    ) {
      var key, storage, dynamicDepends, exports;
      if (typeof name === "object") {
        var def = name;
        name = def.name;
        storage = def.storage;
        key = def.key;
        depends = def.depends;
        declaration = def.declaration;
        context = def.context;
        dynamicDepends = def.dynamicDepends;
        exports = def.exports;
      } else if (arguments.length === 2) {
        declaration = depends;
        depends = null;
      }

      var definition = new Definition(
        STATE.DECLARED,
        name,
        storage,
        key,
        depends,
        declaration,
        context,
        dynamicDepends,
        exports,
      );
      this._define(definition);
    };

    // Used by util.AsyncStorage.
    ModuleSystem.prototype.defineSync = function (def) {
      var definition = new Definition(
        STATE.DEFINED,
        def.name,
        def.storage,
        def.key,
        null,
        null,
        null,
        null,
        def.module,
      );
      this._define(definition);
    };

    ModuleSystem.prototype._define = function (definition) {
      var existing = this._definitionsByName[definition.name];
      if (existing) {
        function throwRedefinitionError() {
          var error = new Error(
            "ymaps.modules: redefinition of " + definition.name,
          );
          // eslint-disable-next-line no-console
          console.error(error);
          throw error;
        }

        if (this._config.useBundles) {
          if (existing.state >= STATE.DECLARED) {
            // Already declared earlier in previous bundle or by the user. Do nothing.
            return;
          } else if (existing.state !== STATE.MENTIONED) {
            throwRedefinitionError();
          }
        } else if (
          existing.state !== STATE.FETCHING ||
          definition.state !== STATE.DECLARED
        ) {
          // Redefinition is allowed only for modules mentioned via map and later fetched via combine.
          throwRedefinitionError();
        }

        existing.state = STATE.DECLARED;
        existing.declaration = definition.declaration;
        existing.context = definition.context;
        // There is no info about missing module in bundle except name, so we need to copy more values.
        if (this._config.useBundles) {
          existing.storage = definition.storage;
          existing.key = definition.key;
          if (definition.depends) {
            // Dependencies may be declared via a function that resolves based on the current environment.
            if (typeof definition.depends == "function") {
              definition.depends = definition.depends.call(
                { name: definition.name },
                this._config.dependenciesContext,
              );
            }
            existing.depends = definition.depends;
          }
          existing.dynamicDepends = definition.dynamicDepends;
          existing.exports = definition.exports;
        }
        return;
      }

      // Dependencies may be declared via a function that resolves based on the current environment.
      if (typeof definition.depends == "function") {
        definition.depends = definition.depends.call(
          { name: definition.name },
          this._config.dependenciesContext,
        );
      }

      definition.depends = definition.depends || EMPTY_ARRAY;

      this._definitionsByName[definition.name] = definition;
      this._saveDefinitionToStorage(definition);
    };

    ModuleSystem.prototype._resolve = function (definition, data) {
      // Return immediately if the module is fully defined, to save precious time and memory.
      if (!definition.dynamicDepends) {
        if (definition.state === STATE.DEFINED) {
          return vow.resolve(definition.exports);
        } else if (definition.state === STATE.ERROR) {
          return vow.reject(definition.exports);
        }
      }

      // Can't go straight to RESOLVING, because we may need to fetch the module.
      if (definition.state < STATE.RESOLVING && !definition.resolvingPromise) {
        definition.resolvingPromise = this._resolveCore(
          definition,
          data,
        ).always(function (promise) {
          definition.resolvingPromise = undefined;
          return promise;
        });
      }

      // Even if the module is already defined, we still need to load dynamic dependencies.
      var dynamicDepends = getDynamicDepends(definition, [data]);

      return vow
        .all([definition.resolvingPromise, this._require(dynamicDepends, data)])
        .then(function () {
          return definition.state === STATE.DEFINED
            ? vow.resolve(definition.exports)
            : vow.reject(definition.exports);
        });
    };

    ModuleSystem.prototype._resolveCore = function (definition, data) {
      // Fetch module and its dependencies.
      return this._fetchModule(definition, data)
        .then(function () {
          definition.state = STATE.RESOLVING;

          // Require all dependencies.
          return this._require(definition.depends, data);
        }, this)
        .then(function defineModule(depends) {
          var explicitAsyncProvisionPromise;

          var implicitAsyncProvisionDeferred;

          function provide(exports, error) {
            if (definition.state === STATE.RESOLVING) {
              definition.state = error ? STATE.ERROR : STATE.DEFINED;
              definition.exports = error || exports;
            }

            if (implicitAsyncProvisionDeferred) {
              implicitAsyncProvisionDeferred.resolve();
            }

            if (error) {
              // eslint-disable-next-line no-console
              console.warn(
                "ymaps.modules: provide(undefined, error) is deprecated and will be removed, throw instead. Module `" +
                  definition.name +
                  "`.",
              );
            }
          }

          // Explicit async provision.
          provide.async = function (promise) {
            if (definition.state === STATE.RESOLVING) {
              explicitAsyncProvisionPromise = promise.then(
                function (exports) {
                  provide(exports);
                },
                function (error) {
                  provide(undefined, error);
                },
              );
            }
          };

          // Some modules are strange.
          provide.provide = provide;
          provide.provideAsync = provide.async;

          provide.dynamicDepends = !definition.dynamicDepends
            ? null
            : {
                getValue: function (key, data) {
                  var module = getDynamicDependency(definition, key, data);
                  if (module === MISSING_DYNAMIC_VALUE) {
                    return vow.reject(
                      new Error(
                        "ymaps.modules: dynamic dependency `" +
                          key +
                          "` is not declared.",
                      ),
                    );
                  }

                  return isModuleReference(module)
                    ? this._require([module], data)
                    : vow.resolve([module]);
                }.bind(this),
                getValueSync: function (key, data) {
                  var module = getDynamicDependency(definition, key, data);
                  if (!isModuleReference(module)) {
                    return module;
                  }

                  var dependencyDefinition = this._findDefinition(module);
                  return dependencyDefinition
                    ? this._requireSingleSync(dependencyDefinition, data)
                    : undefined;
                }.bind(this),
              };

          var context = definition.context || {
            name: definition.name,
            depends: definition.depends,
          };
          try {
            definition.declaration.apply(context, [provide].concat(depends));
          } catch (error) {
            definition.state = STATE.ERROR;
            definition.exports = error;
            return;
          }

          // Wait for explicit asynchronous provision.
          if (explicitAsyncProvisionPromise) {
            return explicitAsyncProvisionPromise;
          }

          if (
            definition.state !== STATE.DEFINED &&
            definition.state !== STATE.ERROR
          ) {
            // eslint-disable-next-line no-console
            console.warn(
              "ymaps.modules: asynchronous provide is deprecated and will be removed. Module `" +
                definition.name +
                "`.",
            );

            implicitAsyncProvisionDeferred = vow.defer();

            return implicitAsyncProvisionDeferred.promise();
          }
        }, this);
    };

    ModuleSystem.prototype.require = function (names, cb, errorCb, thisArg) {
      var extendedSyntax = typeof names === "object" && !utils.isArray(names);
      var returnPromise = arguments.length === 1;
      if (extendedSyntax) {
        cb = names.successCallback;
        errorCb = names.errorCallback;
        thisArg = names.context;
        returnPromise = !cb && !errorCb;
      }

      names = normalizeRequiredNames(names);
      var promise = this._require(names.modules, names.data);

      if (returnPromise) {
        return promise;
      }

      promise.spread(cb, errorCb, thisArg);
    };

    // Used by util.AsyncStorage.
    ModuleSystem.prototype.requireSync = function (names) {
      names = normalizeRequiredNames(names);
      if (names.modules.length !== 1) {
        throw new Error(
          "ymaps.modules: only one module can be required synchronously.",
        );
      }

      var definition = this._findDefinition(names.modules[0]);
      return definition && this._requireSingleSync(definition, names.data);
    };

    ModuleSystem.prototype._requireSingleSync = function (definition, data) {
      var depends = getDynamicDepends(definition, [data]);
      for (var i = 0, l = depends.length; i < l; i++) {
        var dependency = this._findDefinition(depends[i]);
        if (!dependency || !this._requireSingleSync(dependency, data)) {
          return undefined;
        }
      }

      return definition.state === STATE.DEFINED
        ? definition.exports
        : undefined;
    };

    ModuleSystem.prototype._require = function (modules, data) {
      var promises = modules.map(function (x) {
        return this._requireSingle(x, data);
      }, this);

      return vow.all(promises);
    };

    ModuleSystem.prototype._requireSingle = function (name, data) {
      var definition = this._findDefinition(name);
      if (definition) {
        return this._resolve(definition, data);
      }

      // Check if the module can be loaded via combine.
      // Require placed above an actual define is fine, too. Promise.then behaves like nextTick.
      return this._initialized.then(function () {
        var definition = this._findDefinition(name);

        return definition
          ? this._resolve(definition, data)
          : vow.reject(
              new Error(
                "ymaps.modules: module `" +
                  getModuleNameForLogging(name) +
                  "` is not defined.",
              ),
            );
      }, this);
    };

    ModuleSystem.prototype._findDefinition = function (name) {
      if (typeof name === "undefined") {
        return;
      }

      return typeof name === "string"
        ? this._definitionsByName[name]
        : this._definitionsByStorage[name.storage] &&
            this._definitionsByStorage[name.storage][name.key];
    };

    ModuleSystem.prototype._saveDefinitionToStorage = function (
      definition,
      explicit,
    ) {
      if (!definition.key || !definition.storage) {
        return;
      }

      explicit = explicit || {
        key: definition.key,
        storage: definition.storage,
      };
      var keys = utils.isArray(explicit.key) ? explicit.key : [explicit.key];

      for (var i = 0, l = keys.length; i < l; i++) {
        this._definitionsByStorage[explicit.storage] =
          this._definitionsByStorage[explicit.storage] || {};
        this._definitionsByStorage[explicit.storage][keys[i]] = definition;
      }
    };

    ModuleSystem.prototype._fetchModule = function (definition, data) {
      if (definition.state >= STATE.DECLARED) {
        return vow.resolve();
      }

      if (this._config.useBundles) {
        this._fullBundlePromise =
          this._fullBundlePromise || this._loadBundle("full");
        return this._fullBundlePromise;
      }

      definition.fetchingDeferred = definition.fetchingDeferred || vow.defer();

      // Enqueue module for combine.
      if (definition.state === STATE.MENTIONED) {
        definition.state = STATE.QUEUED;

        this._queuedForFetching[definition.name] = {
          definition: definition,
          dataList: [],
        };

        this._enqueueCombine();
      }

      // If combine is not running yet, request some more dynamic dependencies.
      if (definition.state !== STATE.FETCHING) {
        this._queuedForFetching[definition.name].dataList.push(data);
      }

      return definition.fetchingDeferred.promise();
    };

    ModuleSystem.prototype._enqueueCombine = function () {
      if (this._combineEnqueued) {
        return;
      }

      this._combineEnqueued = true;

      // Wait until the map is loaded. Promise.then behaves like nextTick and squashes consecutive requests.
      this._initialized.then(function prepareAliasesAndFetch() {
        this._combineEnqueued = false;

        var fetching = this._queuedForFetching;
        this._queuedForFetching = Object.create(null);

        // Order matters, because some code relies on it.
        // ECMAScript 6.0 guarantees that keys are returnes in the creation order.
        // https://www.ecma-international.org/ecma-262/6.0/#sec-ordinary-object-internal-methods-and-internal-slots-ownpropertykeys
        var allAliases = Object.create(null);
        for (var name in fetching) {
          if (name in fetching) {
            var request = fetching[name];
            var dependantAliases = this._getAliasesToFetchFor(
              name,
              request.dataList,
            );

            utils.extend(allAliases, dependantAliases);
          }
        }

        var aliases = Object.keys(allAliases);
        for (
          var i = 0, l = aliases.length;
          i < l;
          i += this._config.combineBatchSize
        ) {
          this._fetchCombine(
            aliases.slice(i, i + this._config.combineBatchSize),
          );
        }
      }, this);
    };

    ModuleSystem.prototype._loadBundle = function (name) {
      return this._config.fetchBundle(name).then(function (bundleContent) {
        bundleContent.missingModules.forEach(function (name) {
          // No need to count module dependencies, in static bundle case. We load all anyway.
          var definition = new Definition(
            STATE.MENTIONED,
            name,
            undefined,
            undefined,
            [],
            null,
            null,
            undefined,
          );
          this._definitionsByName[name] = definition;
        }, this);

        var sandbox = (this._sandbox =
          this._sandbox || this._config.createSandbox());
        // Split all modules into batches and execute them in separate macrotasks.
        var modules = bundleContent.modules;
        var batchSize = 400;

        function executeNextBatches() {
          return vow.delay().then(function () {
            var batch = modules.splice(0, batchSize);
            batch.forEach(function (f) {
              f(sandbox);
            });
            if (modules.length > 0) {
              return executeNextBatches();
            }
          });
        }

        return executeNextBatches();
      }, this);
    };

    ModuleSystem.prototype._loadModulesMap = function () {
      return this._config.fetchMap().spread(function (data, onFinished) {
        this._processLoadedMap(data);
        onFinished();
      }, this);
    };

    ModuleSystem.prototype._fetchCombine = function (aliases) {
      this._config
        .fetchCombine(aliases)
        .spread(function declareFetchedModules(modules, onFinished) {
          this._sandbox = this._sandbox || this._config.createSandbox();
          for (var i = 0, l = modules.length; i < l; i++) {
            var alias = modules[i][0];
            var definition = this._definitionsByAlias[alias];

            modules[i][1].call(null, this._sandbox);

            if (definition.state === STATE.DECLARED) {
              definition.fetchingDeferred &&
                definition.fetchingDeferred.resolve();
            } else {
              definition.state = STATE.ERROR;
              var error = new Error(
                "[internal] ymaps.modules: module `" +
                  definition.name +
                  "` was not defined after dynamic module loading",
              );
              definition.exports = error;
              definition.fetchingDeferred &&
                definition.fetchingDeferred.reject(error);
            }

            // Whoever uses it may continue to use it, but we're not holding it back from being collected.
            definition.fetchingDeferred = undefined;
          }

          onFinished();
        }, this)
        .catch(function (error) {
          for (var i = 0, l = aliases.length; i < l; i++) {
            var definition = this._definitionsByAlias[aliases[i]];

            var error = new Error(
              "[internal] ymaps.modules: dynamic module loading failed",
            );
            definition.state = STATE.ERROR;
            definition.exports = error;

            definition.fetchingDeferred &&
              definition.fetchingDeferred.reject(error);

            // Whoever uses it may continue to use it, but we're not holding it back from being collected.
            definition.fetchingDeferred = undefined;
          }
        }, this);
    };

    ModuleSystem.prototype._getAliasesToFetchFor = function (
      moduleName,
      dataList,
    ) {
      var tail = [moduleName];
      var aliases = Object.create(null);

      while (tail.length) {
        var current = tail.shift();
        var definition = this._findDefinition(current);
        if (!definition) {
          // eslint-disable-next-line no-console
          console.error(
            "ymaps.modules: trying to fetch unknown module `" +
              getModuleNameForLogging(current) +
              "` while loading `" +
              getModuleNameForLogging(moduleName) +
              "`.",
          );
          return;
        }

        if (definition.state <= STATE.QUEUED) {
          definition.state = STATE.FETCHING;
          aliases[definition.alias] = true;
          Array.prototype.push.apply(tail, definition.depends);
        }

        Array.prototype.push.apply(
          tail,
          getDynamicDepends(definition, dataList),
        );
      }

      return aliases;
    };

    ModuleSystem.prototype._processLoadedMap = function (data) {
      var nameByAlias = {};
      for (var i = 0, l = data.length; i < l; i++) {
        var name = data[i][0];
        var alias = data[i][1];
        nameByAlias[alias] = name;
      }

      function aliasesToNames(aliases) {
        if (typeof aliases === "function") {
          return aliases;
        }

        var result = [];
        for (var i = 0, l = aliases.length; i < l; i += 2) {
          var alias = aliases.substr(i, 2);
          result.push(nameByAlias[alias]);
        }
        return result;
      }

      for (var i = 0, l = data.length; i < l; i++) {
        var name = data[i][0];
        var alias = data[i][1];

        var definition = this._definitionsByName[name];
        if (!definition) {
          var depends = aliasesToNames(data[i][2]);
          var key = data[i][3];
          var storage = data[i][4];
          var dynamicDepends = data[i][5];

          definition = new Definition(
            STATE.MENTIONED,
            name,
            storage,
            key,
            depends,
            null,
            null,
            dynamicDepends,
          );
          this._define(definition);
        }

        definition.alias = alias;
        this._definitionsByAlias[alias] = definition;
      }
    };

    function getDynamicDepends(definition, dataList) {
      if (!definition.dynamicDepends) {
        return EMPTY_ARRAY;
      }

      var depends = [];
      for (var fn in definition.dynamicDepends) {
        if (!hop.call(definition.dynamicDepends, fn)) {
          continue;
        }

        for (var i = 0, l = dataList.length; i < l; i++) {
          var data = dataList[i];
          if (data === undefined) {
            continue;
          }

          var dep = definition.dynamicDepends[fn](data);
          if (isModuleReference(dep)) {
            depends.push(dep);
          }
        }
      }

      return depends;
    }

    function getDynamicDependency(definition, key, data) {
      return hop.call(definition.dynamicDepends, key)
        ? definition.dynamicDepends[key].call(null, data)
        : MISSING_DYNAMIC_VALUE;
    }

    function isModuleReference(module) {
      return typeof module === "string" || isStorageEntry(module);
    }

    function getModuleNameForLogging(name) {
      return name && typeof name === "object"
        ? name.key + "@" + name.storage
        : String(name);
    }

    function isStorageEntry(module) {
      return (
        module != null &&
        typeof module === "object" &&
        typeof module.key === "string" &&
        typeof module.storage === "string"
      );
    }

    /**
     * Converts allowed formats listed below to the first one.
     * 1. { modules: ['name', { key: 'x', storage: 'y' }], data: { foo: 'bar' } }
     * 2. { modules: 'name', data: { foo: 'bar' } }
     * 3. { key: 'x', storage: 'y' }
     * 4. 'name'
     */
    function normalizeRequiredNames(names) {
      var isArray = utils.isArray(names);
      if (typeof names === "object" && !isArray && hop.call(names, "modules")) {
        return {
          modules: utils.isArray(names.modules)
            ? names.modules
            : [names.modules],
          data: names.data,
        };
      }

      return isArray ? { modules: names } : { modules: [names] };
    }

    return module.exports;
  })({ vow: ym.vow, "./ym.utils": ym.utils });

  var commonParams =
    "&mode=" +
    ym.env.server.params.mode +
    "&v=" +
    ym.env.tag +
    (ym.env.cacheVersion ? "-" + ym.env.cacheVersion : "") +
    "&flags=" +
    ym.env.flags.join(",");

  var MAP_URL =
    ym.env.server.url + "/map.js?callback={CALLBACK}" + commonParams;
  var COMBINE_URL =
    ym.env.server.url +
    "/combine.js?callback_prefix={CALLBACK_PREFIX}" +
    commonParams;

  var IMAGES_URL =
    ym.env.server.url +
    "/" +
    ym.env.server.path.replace(/\/$/, "") +
    "/images/";

  ym.modules = new ModuleSystem({
    dependenciesContext: ym,
    combineBatchSize: 500,
    initialBudleName: ym.env.preload.bundle,

    useBundles: ym.env.useBundles,

    fetchMap: function () {
      if (ym.env.flags.indexOf("inline-map") >= 0 && modulesMap) {
        var mapEvalMeasure = ym.performance.startMeasure("@mapjs.eval");
        return ym.vow.resolve([
          modulesMap,
          mapEvalMeasure.finish.bind(mapEvalMeasure),
        ]);
      }

      var callback = JSONP_PREFIX + "_map";
      var url = MAP_URL.replace("{CALLBACK}", callback);

      return jsonp(url, callback).then(function (data) {
        var timings = ym.performance.getResourceTimings(url);
        ym.performance.saveResourceTimings("mapjs", timings);

        var mapEvalMeasure = ym.performance.startMeasure("@mapjs.eval");
        return [data, mapEvalMeasure.finish.bind(mapEvalMeasure)];
      });
    },

    fetchCombine: function (aliases) {
      ym.performance.statistics.combine.total++;
      ym.performance.statistics.combine.modules += aliases.length;

      var size = aliases.length < 100 ? "s" : aliases.length < 300 ? "m" : "l";
      var load = aliases.join("");

      var callbackPrefix = JSONP_PREFIX + "_combine";
      var url =
        COMBINE_URL.replace("{CALLBACK_PREFIX}", callbackPrefix) +
        "&load=" +
        load;
      var callback = callbackPrefix + "_" + load;

      return jsonp(url, callback).then(function (data) {
        var timings = ym.performance.getResourceTimings(url);

        ym.performance.saveResourceTimings("combine_" + size, timings);
        ym.performance.statistics.combine.size += timings.encodedBodySize;

        var combineEvalMeasure = ym.performance.startMeasure(
          "@combine_" + size + ".eval",
        );
        return [data, combineEvalMeasure.finish.bind(combineEvalMeasure)];
      });
    },

    fetchBundle: function (name) {
      // Store namespace in window with some unique name as an easy way to support any requested namespace.
      var namespace = (
        "__ymaps_" +
        ym.env.namespace +
        "_" +
        Date.now()
      ).replace(/\W/g, "_");
      global[namespace] = ym.ns;

      var script = document.createElement("script");
      script.src = ym.env.bundles.BASE + ym.env.bundles[name];
      script.setAttribute("data-ymaps-api-ns", namespace);
      script.setAttribute("data-ymaps-api-version", "2.1.77");
      script.async = true;

      var deferred = ym.vow.defer();
      script.onerror = deferred.reject.bind(deferred);
      ym.ns.__provideBundle = deferred.resolve.bind(deferred);

      document.head.appendChild(script);

      return deferred.promise().always(function (promise) {
        delete global[namespace];
        return promise;
      });
    },

    createSandbox: function () {
      var modules = Object.create(ym.modules);

      modules.importImages = function (imgParams) {
        return {
          get: function (imageName) {
            return IMAGES_URL + imgParams[imageName].src;
          },
        };
      };

      return ym.utils.extend({}, ym, { modules: modules });
    },
  });

  /**
   * @deprecated To be removed in 2.2.
   */
  ym.ns.load = function (moduleList, callback, errorCallback, context) {
    if (typeof moduleList == "function") {
      if (callback) {
        return ym.ns.ready(
          ["package.full"],
          /* callback = */ moduleList,
          /* context = */ callback,
        );
      } else {
        return ym.ns.ready(["package.full"], /* callback = */ moduleList);
      }
    }

    if (typeof moduleList == "string") {
      moduleList = [moduleList];
    }

    return ym.ns.ready.apply(this, arguments);
  };
  (function () {
    ym.ns.modules = {
      // Public API.
      require: function () {
        return ym.modules.require.apply(ym.modules, arguments);
      },
      isDefined: function () {
        return ym.modules.isDefined.apply(ym.modules, arguments);
      },
      requireSync: function () {
        return ym.modules.requireSync.apply(ym.modules, arguments);
      },
      define: function (name, depends, resolveCallback, context) {
        ym.modules.define.apply(ym.modules, arguments);
        return ym.ns.modules;
      },

      // Private API.
      defineSync: deprecated("defineSync"),
      getDefinition: deprecated("getDefinition"),
      getState: deprecated("getState"),
      setOptions: deprecated("setOptions"),
      flush: deprecated("flush"),
      nextTick: deprecated("nextTick"),
      watchResolving: deprecated("watchResolving"),
      __modules: ym.modules,
    };

    /**
     * Wraps ym.modules.fnName with a deprecation warning.
     * @ignore
     * @param {String} fnName
     */
    function deprecated(fnName) {
      return function () {
        console.warn(
          "{NS}.modules.{FN} is not a public API and will be removed from {NS}.modules."
            .replace(/\{NS\}/g, ym.env.namespace)
            .replace(/\{FN\}/g, fnName),
        );

        var result = ym.modules[fnName].apply(ym.modules, arguments);
        return result === ym.modules ? ym.ns.modules : result;
      };
    }
  })();
  (function (global) {
    var vow = ym.vow;

    var requestedEnvPreload = [].concat(
      ["package.system"],
      ym.env.preload.load.split(",").filter(Boolean),
    );

    var preloadMeasure = ym.performance.startMeasure("ymaps.preload");
    var envPreload = ym.modules.require(requestedEnvPreload).then(
      function (values) {
        ym.utils.registerImports(ym.ns, requestedEnvPreload, values);
        preloadMeasure.finish();
        callUserCallback(ym.env.preload.onLoad, ym.ns);
      },
      function (error) {
        callUserCallback(ym.env.preload.onError, error);
        return vow.reject(error);
      },
    );

    var domReady =
      document.readyState === "complete" ||
      document.readyState === "interactive"
        ? vow.resolve()
        : new vow.Promise(function (resolve) {
            document.addEventListener("DOMContentLoaded", resolve, false);
            document.addEventListener("load", resolve, false);
          });

    ym.ns.ready = ready;

    var isFirstReady = true;

    function ready() {
      if (isFirstReady) {
        ym.performance.saveMeasure(
          "ymaps.readyDelay",
          ym.performance.now() - ym.performance.initTimings.responseEnd,
        );
        isFirstReady = false;
      }

      var readyMeasure = ym.performance.startMeasure("ymaps.ready");

      var params = {};
      if (arguments.length) {
        if (
          arguments.length == 1 &&
          typeof arguments[0] == "object" &&
          !arguments[0].length
        ) {
          // Call with hash of params.
          params = arguments[0];
        } else if (typeof arguments[0] != "function") {
          // Call with modules list as first parameter.
          params.require =
            typeof arguments[0] == "string" ? [arguments[0]] : arguments[0];
          params.successCallback = arguments[1];
          params.errorCallback =
            arguments[2] && typeof arguments[2] == "function"
              ? arguments[2]
              : null;
          params.context =
            arguments[2] && typeof arguments[2] == "object"
              ? arguments[2]
              : arguments[3];
        } else {
          // Call with regular signature: `successCallback[, errorCallback], context`.
          params.successCallback = arguments[0];
          params.errorCallback =
            arguments[1] && typeof arguments[1] == "function"
              ? arguments[1]
              : null;
          params.context =
            arguments[1] && typeof arguments[1] == "object"
              ? arguments[1]
              : arguments[2];
        }
      }

      var explicit = params.require || [];
      var promise = vow
        .all([ym.modules.require(explicit), envPreload, domReady])
        .spread(function (values) {
          ym.utils.registerImports(ym.ns, explicit, values);

          readyMeasure.finish();

          return ym.ns;
        });

      // Call user callback in setTimeout to trigger default error handling mechanism (window.onerror).
      promise.then(
        params.successCallback &&
          function (ym) {
            setTimeout(params.successCallback.bind(params.context), 0, ym);
          },
        params.errorCallback &&
          function (error) {
            setTimeout(params.errorCallback.bind(params.context), 0, error);
          },
      );

      return promise;
    }

    function callUserCallback(callbackName, value) {
      if (!callbackName) {
        return;
      }

      var callbackData = getMethodByPath(global, callbackName);
      if (callbackData) {
        // Call user callback in setTimeout to trigger default error handling mechanism (window.onerror).
        setTimeout(function () {
          console.log(callbackData);
          callbackData.method.call(callbackData.context, value);
        });
      }
    }

    function getMethodByPath(parentNs, path) {
      var subObj = parentNs;
      path = path.split(".");
      var i = 0,
        l = path.length - 1;
      for (; i < l; i++) {
        subObj = subObj[path[i]];
        if (!subObj) {
          return undefined;
        }
      }
      return {
        method: subObj[path[l]],
        context: subObj,
      };
    }
  })(this);
  if (ym.env.server.params.csp && !ym.supports.csp.isSupported) {
    ym.logger.warning("CSP is not suported in this browser");
  }

  // Preload vector layer.
  ym.modules.define(
    "vectorEngine.loadEngine",
    [
      "vow",

      // Modules that the engine requires to function.
      // Check src/jsapi_2_1_modules/imports.ts for their usage.
      "Hotspot",
      "Monitor",
      "collection.Item",
      "event.Manager",
      "hotspot.layer.Hint",
      "hotspot.layer.optionMapper",
      "interactivityModel.EventController",
      "interactivityModel.layer",
      "option.Manager",
      "poi.BalloonManager",
      "util.shapeFactory",
    ],
    function (provide, vow) {
      if (ym.env.namespace !== "ymaps") {
        throw new Error("Vector supports only `ymaps` namespace.");
      }
      if (ym.env.vectorVersion == null) {
        throw new Error("No vector version.");
      }

      function loadEngine() {
        // The vector engine is served as a separate library.
        var deferred = vow.defer();
        var script = document.createElement("script");
        script.onload = deferred.resolve.bind(deferred);
        script.onerror = deferred.reject.bind(deferred);

        script.src = ym.env.hosts.vectorIndex.replace(
          "{{version}}",
          ym.env.vectorVersion,
        );
        if (ym.env.vectorEngineFileName) {
          script.src = script.src.replace(
            "vector.min.js",
            ym.env.vectorEngineFileName,
          );
        }

        document.head.insertAdjacentElement("afterbegin", script);

        return deferred.promise().catch(function () {
          return vow.reject(new Error("Failed to load vector engine"));
        });
      }

      var loadingProcess = null;
      provide(function () {
        loadingProcess = loadingProcess || loadEngine();
        return loadingProcess;
      });
    },
  );
  ym.modules.define("vectorEngine.preload", [], function (provide) {
    if (ym.supports.vector.isSupported()) {
      ym.modules
        .require(["vectorEngine.loadEngine"])
        .spread(function (loadEngine) {
          loadEngine();
        });
    }
    provide({});
  });
  ym.modules.allowRemoteLoading();

  // Register namespace in window.
  if (ym.env.namespace) {
    ym.utils.setDeep(global, ym.env.namespace, ym.ns);
  }

  ym.performance.init({
    url: ym.env.hosts.api.statCounter + "/counter",
    data:
      "/path=" +
      ym.env.version.replace(/\W/g, "_") +
      "." +
      ym.env.browser.platform,
    enable:
      ym.env.counters == "all" ||
      (Math.random() < PERFORMANCE_SHARE && !ym.env.server.params.debug),
    initUrl: document.currentScript && document.currentScript.src,
    useSendBeacon: !ym.env.server.params.csp,
  });

  if (!ym.env.hasValidApiKey) {
    ym.env.apikey = undefined;
    if (typeof ym.env.hasValidApiKey !== "undefined") {
      console.warn("(Yandex Maps JS API): Invalid API key");
    }
  }

  initEvalMeasure.finish();
})(
  {
    vectorVersion: "5.11.4",
    vectorVersionTimestamp: 1607268669160,
    cacheVersion: "3",
    type: "production",
    flags: [],
    server: {
      url: "https://api-maps.yandex.ru/2.1.77",
      path: "build/debug",
      params: {
        onload: "__yandex-maps-api-onload__$$1eosav2ee",
        onerror: "__yandex-maps-api-onerror__$$1eosav2ee",
        ns: "",
        mode: "debug",
        csp: null,
      },
    },
    preload: {
      load: "",
      bundle: "full",
      onLoad: "__yandex-maps-api-onload__$$1eosav2ee",
      onError: "__yandex-maps-api-onerror__$$1eosav2ee",
    },
    mode: "debug",
    debug: true,
    namespace: false,
    enterprise: false,
    hasApiKeyParam: false,
    browser: {
      name: "Firefox",
      version: "83.0",
      base: "Unknown",
      engine: "Gecko",
      engineVersion: "83.0",
      osName: "Fedora",
      osFamily: "Linux",
      osVersion: 0,
      isMobile: false,
      isTablet: false,
      multiTouch: false,
      platform: "Desktop",
      cssPrefix: "Moz",
    },
    lang: "ru_RU",
    languageCode: "ru",
    countryCode: "RU",
    hosts: {
      api: {
        main: "https://api-maps.yandex.ru/",
        ua: "https://yandex.ru/legal/maps_termsofuse/?lang={{lang}}",
        maps: "https://yandex.ru/maps/",
        statCounter: "https://yandex.ru/clck/",
        services: {
          coverage: "https://api-maps.yandex.ru/services/coverage/",
          geocode: "https://geocode-maps.yandex.ru/",
          geoxml: "https://api-maps.yandex.ru/services/geoxml/",
          inception: "https://api-maps.yandex.ru/services/inception/",
          panoramaLocate: "https://api-maps.yandex.ru/services/panoramas/",
          search: "https://unr.nagayev.vercel.app/api/search",
          suggest: "https://suggest-maps.yandex.ru/",
          regions: "https://api-maps.yandex.ru/services/regions/",
          route: "https://api-maps.yandex.ru/services/route/",
        },
      },
      layers: {
        map: "https://vec0%d.maps.yandex.net/tiles?l=map&%c&%l",
        mapj: "https://vec0%d.maps.yandex.net/tiles?l=mapj&%c&%l",
        sat: "https://core-sat.maps.yandex.net/tiles?l=sat&%c&%l",
        skl: "https://vec0%d.maps.yandex.net/tiles?l=skl&%c&%l",
        sklj: "https://vec0%d.maps.yandex.net/tiles?l=sklj&%c&%l",
        stv:
          "https://0%d.core-stv-renderer.maps.yandex.net/2.x/tiles?l=stv&%c&v=%v&%l&format=png",
        sta:
          "https://0%d.core-stv-renderer.maps.yandex.net/2.x/tiles?l=sta&%c&v=%v&%l&format=png",
        staHotspot:
          "https://core-stv-renderer.maps.yandex.net/2.x/tiles?l=stj&%c&v=%v&format=js",
        staHotspotKey: "%c&l=stj&tm=%v",
        carparks: "https://core-carparks-renderer-lots.maps.yandex.net/",
      },
      metro_RU: "https://yandex.ru/metro/",
      metro_UA: "https://yandex.ua/metro/",
      metro_BY: "https://yandex.by/metro/",
      metro_US: "https://yandex.com/metro/",
      traffic: "https://core-jams-rdr-cache.maps.yandex.net/",
      trafficInfo: "https://core-jams-info.maps.yandex.net/",
      trafficArchive: "https://core-jams-rdr-hist.maps.yandex.net/",
      vectorIndex:
        "https://yastatic.net/s3/mapsapi-v3/vector/{{version}}/out/vector.min.js",
      vectorTiles:
        "https://vec0{{hostAlias}}.maps.yandex.net/vmap2/tiles?lang={{lang}}&x={{x}}&y={{y}}&z={{z}}&zmin={{zmin}}&zmax={{zmax}}&v={{version}}",
      vectorImages:
        "https://vec0{{hostAlias}}.maps.yandex.net/vmap2/icons?id={{id}}&scale={{scale}}",
      vectorMeshes:
        "https://vec0{{hostAlias}}.maps.yandex.net/vmap2/meshes?id={{id}}",
      vectorGlyphs:
        "https://vec0{{hostAlias}}.maps.yandex.net/vmap2/glyphs?lang={{lang}}&font_id={{fontId}}&range={{range}}",
      indoorTiles: "https://vec0{{hostAlias}}.maps.yandex.net/",
      panoramasTiles: "https://pano.maps.yandex.net/%s/%z.%x.%y",
      taxiRouteInfo:
        "https://taxi-routeinfo.taxi.yandex.net/taxi_info?clid=yamaps&apikey=f6d7c076e16e4d53a928961595e76215&rll={rll}",
    },
    layers: {
      map: { version: "20.12.06-0", scaled: true, hotspotZoomRange: [8, 23] },
      sat: { version: "3.741.0" },
      skl: { version: "20.12.06-0", scaled: true, hotspotZoomRange: [8, 23] },
      sta: { version: "2020.12.06.15.15-1" },
      stv: { version: "2020.12.06.15.15-1" },
      carparks: { version: "20201205-190128" },
      trf: { version: "1607268540", scaled: true },
    },
    geolocation: {
      longitude: 45.018316,
      latitude: 53.195063,
      isHighAccuracy: false,
      span: { longitude: 0.401574, latitude: 0.189976 },
    },
    token: "550da62d997ab09148bb301a32a46478",
    distribution: {},
    version: "2.1.77",
    majorVersion: "2.1",
    cssPrefix: "ymaps-2-1-77-",
    tag: "2.1.77-27",
    coordinatesOrder: "latlong",
    useBundles: true,
    bundles: {
      BASE:
        "https://yastatic.net/s3/front-maps-static/front-jsapi-v2-1/2.1.77-27/build",
      panoramas: "/debug/panoramas-8b6d1f3eb7a10fc4789105a42dd679caf7b62031.js",
      full: "/debug/full-1482a76126513edc06c1006be2047397367fffa0.js",
    },
  },
  null,
);
