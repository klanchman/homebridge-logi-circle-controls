const BaseSwitch = require('./BaseSwitch')

class LEDPowerSwitch extends BaseSwitch {
  constructor(attrs) {
    super({ ...attrs, apiPropName: 'ledEnabled', subtype: 'led' })
  }
}

module.exports = LEDPowerSwitch
