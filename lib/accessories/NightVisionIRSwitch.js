const BaseSwitch = require('./BaseSwitch')

class NightVisionIRSwitch extends BaseSwitch {
  constructor(attrs) {
    super({
      ...attrs,
      apiPropName: 'nightVisionIrLedsEnabled',
      subtype: 'nightVisionIR',
    })
  }
}

module.exports = NightVisionIRSwitch
