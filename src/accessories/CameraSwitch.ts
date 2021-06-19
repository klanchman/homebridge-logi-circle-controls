import type {
  API,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  Logging,
} from 'homebridge'
import { LogiService } from '../LogiService'
import { BaseSwitch, SwitchConfig } from './BaseSwitch'

export class CameraSwitch extends BaseSwitch {
  constructor(
    api: API,
    log: Logging,
    switchConfig: SwitchConfig,
    logiService: LogiService,
  ) {
    super(api, log, switchConfig, 'streamingMode', logiService, 'camera')
  }

  /**
   * Gets the state of the switch
   */
  async getState(callback: CharacteristicGetCallback) {
    try {
      const response = await this.logiService.request(
        'get',
        `accessories/${this.switchConfig.deviceId}`,
      )

      const state = response.data.configuration[this.apiPropName] === 'onAlert'
      callback(undefined, state)
    } catch (error) {
      callback(error)
    }
  }

  /**
   * Sets the switch state
   */
  async setState(
    nextState: CharacteristicValue,
    callback: CharacteristicSetCallback,
  ) {
    try {
      await this.logiService.request(
        'put',
        `accessories/${this.switchConfig.deviceId}`,
        {
          [this.apiPropName]: nextState ? 'onAlert' : 'off',
        },
      )

      callback()
    } catch (error) {
      callback(error)
    }
  }
}
