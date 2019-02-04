const EventLite = require("event-lite");
module.exports = {
  EventEmitter: class  {
    constructor() {
      this.events = new EventLite;
    }
    on(...args) {
      return this.events.on(...args);
    }
    off(...args) {
      return this.events.off(...args);
    }
    once(...args) {
      return this.events.once(...args);
    }
    emit(...args) {
      return this.events.emit(...args);
    }
    listeners(name) {
      return this.events.listeners && this.events.listeners[name] || [];
    }
  }
};
