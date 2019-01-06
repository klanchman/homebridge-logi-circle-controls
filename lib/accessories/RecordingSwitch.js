const BaseSwitch = require('./BaseSwitch')

/**
 * The RecordingSwitch actually toggles `privacyMode` on the API, which is
 * inverted from how the recording switch should be displayed.
 *
 * e.g. If `privacyMode: false`, then the RecordingSwitch is on, and vice versa.
 */
class RecordingSwitch extends BaseSwitch {
  constructor(attrs) {
    super({ ...attrs, apiPropName: 'privacyMode', subtype: 'recording' })
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

      const state = !response.data.configuration[this.apiPropName]
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
          [this.apiPropName]: !nextState,
        },
      )

      callback()
    } catch (error) {
      callback(error)
    }
  }
}

module.exports = RecordingSwitch
