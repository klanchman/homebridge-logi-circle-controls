const BaseSwitch = require('./BaseSwitch')

class PrivacyModeSwitch extends BaseSwitch {
  constructor(attrs) {
    super({ ...attrs, apiPropName: 'privacyMode' })
  }
}

module.exports = PrivacyModeSwitch
