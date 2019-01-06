const BaseSwitch = require('./BaseSwitch')

class LEDSwitch extends BaseSwitch {
  constructor(attrs) {
    super({ ...attrs, apiPropName: 'ledEnabled', subtype: 'led' })
  }
}

module.exports = LEDSwitch
