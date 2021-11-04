import type { API, CharacteristicValue, Logging, Service } from 'homebridge'

import { AccessoryConfiguration, LogiService } from '../LogiService'

export interface SwitchConfig {
  deviceId: string
  name: string
}

export class BaseSwitch {
  readonly switchService: Service
  readonly subtype: string

  constructor(
    protected readonly api: API,
    protected readonly log: Logging,
    protected switchConfig: SwitchConfig,
    protected apiPropName: keyof AccessoryConfiguration,
    protected logiService: LogiService,
    subtype?: string,
  ) {
    this.subtype = subtype || apiPropName

    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { Characteristic, Service } = api.hap

    this.switchService = new Service.Switch(
      this.switchConfig.name,
      this.subtype,
    )

    this.switchService
      .getCharacteristic(Characteristic.On)
      .onGet(this.getState.bind(this))
      .onSet(this.setState.bind(this))
  }

  /**
   * Gets the state of the switch
   */
  async getState() {
    const response = await this.logiService.getAccessoryInfo(
      this.switchConfig.deviceId,
    )

    return response.configuration[this.apiPropName]
  }

  /**
   * Sets the switch state
   */
  async setState(nextState: CharacteristicValue) {
    await this.logiService.updateAccessory(this.switchConfig.deviceId, {
      [this.apiPropName]: nextState,
    })
  }
}
