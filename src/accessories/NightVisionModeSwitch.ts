import type { API, CharacteristicValue, Logging } from 'homebridge'

import { LogiService } from '../LogiService'

import { BaseSwitch, SwitchConfig } from './BaseSwitch'

export class NightVisionModeSwitch extends BaseSwitch {
  constructor(
    api: API,
    log: Logging,
    switchConfig: SwitchConfig,
    logiService: LogiService,
  ) {
    super(
      api,
      log,
      switchConfig,
      'nightVisionMode',
      logiService,
      'nightVisionMode',
    )
  }

  /**
   * Gets the state of the switch
   */
  async getState() {
    const response = await this.logiService.getAccessoryInfo(
      this.switchConfig.deviceId,
    )

    return response.configuration[this.apiPropName] === 'auto'
  }

  /**
   * Sets the switch state
   * @param nextState The desired switch state
   */
  async setState(nextState: CharacteristicValue) {
    await this.logiService.updateAccessory(this.switchConfig.deviceId, {
      [this.apiPropName]: nextState ? 'auto' : 'off',
    })
  }
}
