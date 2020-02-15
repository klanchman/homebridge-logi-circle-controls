import { NodeCallback } from '../utils/types'
import { BaseSwitch, SwitchConfig } from './BaseSwitch'
import LogiService = require('../LogiService')

export class CameraSwitch extends BaseSwitch {
  constructor(switchConfig: SwitchConfig, logiService: LogiService) {
    super(switchConfig, 'streamingMode', logiService, 'camera')
  }

  /**
   * Gets the state of the switch
   */
  getState = async (callback: NodeCallback<boolean>) => {
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
  setState = async (nextState: boolean, callback: NodeCallback<never>) => {
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
