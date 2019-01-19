const BaseSwitch = require('./BaseSwitch')

class NightVisionModeSwitch extends BaseSwitch {
  constructor(attrs) {
    super({
      ...attrs,
      apiPropName: 'nightVisionMode',
      subtype: 'nightVisionMode',
    })
  }

  /**
   * Gets the state of the switch
   * @param {function} callback Node callback, takes Error? and Boolean?
   */
  async getState(callback) {
    try {
      const response = await this.logiService.request(
        'get',
        `accessories/${this.switchConfig.deviceId}`,
      )

      const state = response.data.configuration[this.apiPropName] === 'auto'
      callback(undefined, state)
    } catch (error) {
      callback(error)
    }
  }

  /**
   * Sets the switch state
   * @param {boolean} nextState The desired switch state
   * @param {function} callback Node callback, takes Error?
   */
  async setState(nextState, callback) {
    try {
      await this.logiService.request(
        'put',
        `accessories/${this.switchConfig.deviceId}`,
        {
          [this.apiPropName]: nextState ? 'auto' : 'off',
        },
      )

      callback()
    } catch (error) {
      callback(error)
    }
  }
}

module.exports = NightVisionModeSwitch
