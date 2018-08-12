const BaseSwitch = require('./BaseSwitch')

class PrivacyModeSwitch extends BaseSwitch {
  constructor(switchConfig, logiService, log, Service, Characteristic) {
    super(
      switchConfig,
      'privacyMode',
      logiService,
      log,
      Service,
      Characteristic,
    )
  }
}

module.exports = PrivacyModeSwitch
