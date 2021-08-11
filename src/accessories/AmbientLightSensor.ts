import {
  API,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  Logging,
  Service,
} from 'homebridge'
import { LogiService } from '../LogiService'
import { SwitchConfig } from './BaseSwitch'

export class AmbientLightSensor {
  alsService: Service

  constructor(
    protected readonly api: API,
    protected readonly log: Logging,
    protected switchConfig: SwitchConfig,
    protected logiService: LogiService,
  ) {
    const { Characteristic, Service } = api.hap

    this.alsService = new Service.LightSensor(switchConfig.name)

    this.alsService
      .getCharacteristic(Characteristic.CurrentAmbientLightLevel)
      .on(CharacteristicEventTypes.GET, this.getState.bind(this))
  }

  private async getState(callback: CharacteristicGetCallback) {
    try {
      const response = await this.logiService.getAccessoryInfo(
        this.switchConfig.deviceId,
      )

      // alsLevel appears to be measured in lux, which is what HomeKit expects
      callback(undefined, response.configuration.alsLevel)
    } catch (error) {
      callback(error)
    }
  }
}
