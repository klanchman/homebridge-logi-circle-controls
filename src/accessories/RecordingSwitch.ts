import type { API, CharacteristicValue, Logging } from 'homebridge'

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
   */
  async getState() {
    const response = await this.logiService.getAccessoryInfo(
      this.switchConfig.deviceId,
    )

    return !response.configuration[this.apiPropName]
  }

  /**
   * Sets the switch state
   * @param nextState The desired switch state
   */
  async setState(nextState: CharacteristicValue) {
    await this.logiService.updateAccessory(this.switchConfig.deviceId, {
      [this.apiPropName]: !nextState,
    })
  }
}
