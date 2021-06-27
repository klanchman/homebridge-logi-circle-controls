import type {
  API,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  Logging,
} from 'homebridge'
import { LogiService } from '../LogiService'
import { BaseSwitch, SwitchConfig } from './BaseSwitch'

/**
 * The RecordingSwitch actually toggles `privacyMode` on the API, which is
 * inverted from how the recording switch should be displayed.
 *
 * e.g. If `privacyMode: false`, then the RecordingSwitch is on, and vice versa.
 */
export class RecordingSwitch extends BaseSwitch {
  constructor(
    api: API,
    log: Logging,
    switchConfig: SwitchConfig,
    logiService: LogiService,
  ) {
    super(api, log, switchConfig, 'privacyMode', logiService, 'recording')
  }

  /**
   * Gets the state of the switch
   * @param {function} callback Node callback, takes Error? and Boolean?
   */
  async getState(callback: CharacteristicGetCallback) {
    try {
      const response = await this.logiService.getAccessoryInfo(
        this.switchConfig.deviceId,
      )

      const state = !response.configuration.privacyMode
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
  async setState(
    nextState: CharacteristicValue,
    callback: CharacteristicSetCallback,
  ) {
    try {
      await this.logiService.updateAccessory(this.switchConfig.deviceId, {
        privacyMode: !nextState,
      })

      callback()
    } catch (error) {
      callback(error)
    }
  }
}
