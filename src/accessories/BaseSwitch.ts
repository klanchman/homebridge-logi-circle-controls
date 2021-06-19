import type {
  API,
  CharacteristicGetCallback,
  CharacteristicSetCallback,
  CharacteristicValue,
  Logging,
  Service,
} from 'homebridge'
import { CharacteristicEventTypes } from 'homebridge'
import { LogiService } from '../LogiService'

export interface SwitchConfig {
  deviceId: string
  name: string
}

export class BaseSwitch {
  switchService: Service

  private subtype: string

  constructor(
    protected readonly api: API,
    protected readonly log: Logging,
    protected switchConfig: SwitchConfig,
    protected apiPropName: string,
    protected logiService: LogiService,
    subtype?: string,
  ) {
    this.subtype = subtype || apiPropName

    const { Characteristic, Service } = api.hap

    this.switchService = new Service.Switch(
      this.switchConfig.name,
      this.subtype,
    )

    this.switchService
      .getCharacteristic(Characteristic.On)
      .on(CharacteristicEventTypes.GET, this.getState.bind(this))
      .on(CharacteristicEventTypes.SET, this.setState.bind(this))
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

      const state = response.data.configuration[this.apiPropName]
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
          [this.apiPropName]: nextState,
        },
      )

      callback()
    } catch (error) {
      callback(error)
    }
  }
}
