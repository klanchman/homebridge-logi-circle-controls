import { Switch } from 'hap-nodejs/dist/lib/gen/HomeKit'
import LogiService from '../LogiService'
import { HomebridgeAPI } from '../utils/HomebridgeAPI'
import { NodeCallback } from '../utils/types'

export interface SwitchConfig {
  deviceId: string
  name: string
}

export class BaseSwitch {
  switchService: Switch

  private subtype: string

  constructor(
    protected switchConfig: SwitchConfig,
    protected apiPropName: string,
    protected logiService: LogiService,
    subtype?: string,
  ) {
    this.subtype = subtype || apiPropName

    const { Characteristic, Service } = HomebridgeAPI.shared

    this.switchService = new Service.Switch(
      this.switchConfig.name,
      this.subtype,
    )

    // FIXME: How to avoid the `as any`?
    this.switchService
      .getCharacteristic(Characteristic.On)!
      .on('get' as any, this.getState)
      .on('set' as any, this.setState as any)
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

      const state = response.data.configuration[this.apiPropName]
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
          [this.apiPropName]: nextState,
        },
      )

      callback()
    } catch (error) {
      callback(error)
    }
  }
}
