const BaseSwitch = require('./BaseSwitch')

class LEDPowerSwitch extends BaseSwitch {
  constructor(switchConfig, logiService, log, Service, Characteristic) {
    super(switchConfig, 'ledEnabled', logiService, log, Service, Characteristic)
  }
}

module.exports = LEDPowerSwitch
