const BaseSwitch = require('./BaseSwitch')

class StreamingModeSwitch extends BaseSwitch {
  constructor(switchConfig, logiService, log, Service, Characteristic) {
    super(
      switchConfig,
      'streamingMode',
      logiService,
      log,
      Service,
      Characteristic,
    )
  }
}

module.exports = StreamingModeSwitch
