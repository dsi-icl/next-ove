const replace = `{
                Encoder: function() {
                  return {
                    encode: function(packet) {
                      return [JSON.stringify({json: packet, values: {}})];
                    }
                  };
                },
                Decoder: function() {
                  return {
                    decode: function() {
                      console.log("Decoding");
                    },
                    destroy: function() {
                      return undefined;
                    },
                    on: function(event, fn){
                      this._callbacks = this._callbacks || {};
                      (this._callbacks["\$" + event] = this._callbacks["\$" + event] || [])
                        .push(fn);
                      return this;
                    },
                    addEventListener: function(event, fn){
                      this._callbacks = this._callbacks || {};
                      (this._callbacks["\$" + event] = this._callbacks["\$" + event] || [])
                        .push(fn);
                      return this;
                    },
                    once: function(event, fn){
                      function on() {
                        this.off(event, on);
                        fn.apply(this, arguments);
                      }

                      on.fn = fn;
                      this.on(event, on);
                      return this;
                    },
                    off: function(event, fn){
                      this._callbacks = this._callbacks || {};

                      // all
                      if (0 == arguments.length) {
                        this._callbacks = {};
                        return this;
                      }

                      // specific event
                      var callbacks = this._callbacks["\$" + event];
                      if (!callbacks) return this;

                      // remove all handlers
                      if (1 == arguments.length) {
                        delete this._callbacks["\$" + event];
                        return this;
                      }

                      // remove specific handler
                      var cb;
                      for (var i = 0; i < callbacks.length; i++) {
                        cb = callbacks[i];
                        if (cb === fn || cb.fn === fn) {
                          callbacks.splice(i, 1);
                          break;
                        }
                      }

                      // Remove event specific arrays for event types that no
                      // one is subscribed for to avoid memory leak.
                      if (callbacks.length === 0) {
                        delete this._callbacks["\$" + event];
                      }

                      return this;
                    },
                    removeListener: function(event, fn){
                      this._callbacks = this._callbacks || {};

                      // all
                      if (0 == arguments.length) {
                        this._callbacks = {};
                        return this;
                      }

                      // specific event
                      var callbacks = this._callbacks["\$" + event];
                      if (!callbacks) return this;

                      // remove all handlers
                      if (1 == arguments.length) {
                        delete this._callbacks["\$" + event];
                        return this;
                      }

                      // remove specific handler
                      var cb;
                      for (var i = 0; i < callbacks.length; i++) {
                        cb = callbacks[i];
                        if (cb === fn || cb.fn === fn) {
                          callbacks.splice(i, 1);
                          break;
                        }
                      }

                      // Remove event specific arrays for event types that no
                      // one is subscribed for to avoid memory leak.
                      if (callbacks.length === 0) {
                        delete this._callbacks["\$" + event];
                      }

                      return this;
                    },
                    removeAllListeners: function(event, fn){
                      this._callbacks = this._callbacks || {};

                      // all
                      if (0 == arguments.length) {
                        this._callbacks = {};
                        return this;
                      }

                      // specific event
                      var callbacks = this._callbacks["\$" + event];
                      if (!callbacks) return this;

                      // remove all handlers
                      if (1 == arguments.length) {
                        delete this._callbacks["\$" + event];
                        return this;
                      }

                      // remove specific handler
                      var cb;
                      for (var i = 0; i < callbacks.length; i++) {
                        cb = callbacks[i];
                        if (cb === fn || cb.fn === fn) {
                          callbacks.splice(i, 1);
                          break;
                        }
                      }

                      // Remove event specific arrays for event types that no
                      // one is subscribed for to avoid memory leak.
                      if (callbacks.length === 0) {
                        delete this._callbacks["\$" + event];
                      }

                      return this;
                    },
                    removeEventListener: function(event, fn){
                      this._callbacks = this._callbacks || {};

                      // all
                      if (0 == arguments.length) {
                        this._callbacks = {};
                        return this;
                      }

                      // specific event
                      var callbacks = this._callbacks["\$" + event];
                      if (!callbacks) return this;

                      // remove all handlers
                      if (1 == arguments.length) {
                        delete this._callbacks["\$" + event];
                        return this;
                      }

                      // remove specific handler
                      var cb;
                      for (var i = 0; i < callbacks.length; i++) {
                        cb = callbacks[i];
                        if (cb === fn || cb.fn === fn) {
                          callbacks.splice(i, 1);
                          break;
                        }
                      }

                      // Remove event specific arrays for event types that no
                      // one is subscribed for to avoid memory leak.
                      if (callbacks.length === 0) {
                        delete this._callbacks["\$" + event];
                      }

                      return this;
                    },
                    emit: function(event){
                      this._callbacks = this._callbacks || {};

                      var args = new Array(arguments.length - 1)
                        , callbacks = this._callbacks["\$" + event];

                      for (var i = 1; i < arguments.length; i++) {
                        args[i - 1] = arguments[i];
                      }

                      if (callbacks) {
                        callbacks = callbacks.slice(0);
                        for (var i = 0, len = callbacks.length; i < len; ++i) {
                          callbacks[i].apply(this, args);
                        }
                      }

                      return this;
                    },
                    listeners: function(event){
                      this._callbacks = this._callbacks || {};
                      return this._callbacks["\$" + event] || [];
                    },
                    hasListeners: function(event){
                      return !! this.listeners(event).length;
                    },
                    add: function(chunk) {
                      var packet = JSON.parse(chunk).json;
                      if (this.isPacketValid(packet)) {
                        this.emit("decoded", packet);
                      } else {
                        throw new Error("invalid format");
                      }
                    },
                    isPacketValid: function(args) {
                      const isNamespaceValid = typeof args.nsp === "string";
                      const isAckIdvalid = args.id === undefined || Number.isInteger(args.id);
                      if (!isNamespaceValid || !isAckIdvalid) return false;
                      switch (args.type) {
                        case 0: return args.data === undefined || typeof args.data === "object";
                        case 1: return args.data === undefined;
                        case 2: return Array.isArray(args.data) && args.data.length > 0;
                        case 3: return Array.isArray(args.data);
                        case 4: return typeof args.data === "object";
                        default: return false;
                      }
                    }
                  };
                }
              }`;

const readFileSync = require("fs").readFileSync;
const writeFileSync = require("fs").writeFileSync;
const cp = require("fs").cp;
const path = require('path');
const glob = require("glob").glob;

glob(path.join(__dirname, "..", "..", "node_modules", "@socket.io", "admin-ui", "ui", "dist", "js", "app.*.js")).then(files => {
  cp(files[0], `${files[0]}.old`, console.error);
  let cur = readFileSync(files[0]).toString();
  cur = cur.replace("'msgpack' === o ? ke.a : null", `'msgpack' === o ? ke.a : ${replace}`);
  writeFileSync(files[0], cur);
}).catch(console.error);