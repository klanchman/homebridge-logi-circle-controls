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
      const response = await this.logiService.getAccessoryInfo(
        this.switchConfig.deviceId,
      )

      const state = response.configuration[this.apiPropName] === 'onAlert'
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
      await this.logiService.updateAccessory(this.switchConfig.deviceId, {
        [this.apiPropName]: nextState ? 'onAlert' : 'off',
      })

      callback()
    } catch (error) {
      callback(error)
    }
  }
}
