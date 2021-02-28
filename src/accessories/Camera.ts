import type { AccessoryPlugin, API, Logging } from 'homebridge'
import LogiService from '../LogiService'
import { AccessoryConfig } from '../utils/Config'
import { PackageInfo } from '../utils/PackageInfo'
import { BaseSwitch } from './BaseSwitch'
import { CameraSwitch } from './CameraSwitch'
import { LEDSwitch } from './LEDSwitch'
import { NightVisionIRSwitch } from './NightVisionIRSwitch'
import { RecordingSwitch } from './RecordingSwitch'

export class Camera implements AccessoryPlugin {
  name: string

  private informationService
  private switches: BaseSwitch[]

  constructor(
    private readonly api: API,
    private readonly log: Logging,
    config: AccessoryConfig,
    private logiService: LogiService,
  ) {
    this.switches = []

    const { Characteristic, Service } = api.hap

    this.name = config.name
    this.informationService = new Service.AccessoryInformation(config.name, '')
    this.informationService
      .setCharacteristic(Characteristic.Manufacturer, 'Kyle Lanchman')
      .setCharacteristic(Characteristic.Model, PackageInfo.platformName)
      .setCharacteristic(Characteristic.SerialNumber, 'None')
      .setCharacteristic(Characteristic.FirmwareRevision, PackageInfo.version)

    if (!config.camera.disabled) {
      this.switches.push(
        new CameraSwitch(
          this.api,
          this.log,
          {
            name: config.camera.name,
            deviceId: config.deviceId,
          },
          this.logiService,
        ),
      )
    }

    if (!config.led.disabled) {
      this.switches.push(
        new LEDSwitch(
          this.api,
          this.log,
          {
            name: config.led.name,
            deviceId: config.deviceId,
          },
          this.logiService,
        ),
      )
    }

    if (!config.recording.disabled) {
      this.switches.push(
        new RecordingSwitch(
          this.api,
          this.log,
          {
            name: config.recording.name,
            deviceId: config.deviceId,
          },
          this.logiService,
        ),
      )
    }

    if (!config.nightVisionMode.disabled) {
      this.switches.push(
        new NightVisionIRSwitch(
          this.api,
          this.log,
          {
            name: config.nightVisionMode.name,
            deviceId: config.deviceId,
          },
          this.logiService,
        ),
      )
    }

    if (!config.nightVisionIR.disabled) {
      this.switches.push(
        new NightVisionIRSwitch(
          this.api,
          this.log,
          {
            name: config.nightVisionIR.name,
            deviceId: config.deviceId,
          },
          this.logiService,
        ),
      )
    }
  }

  getServices() {
    return [this.informationService, ...this.switches.map(s => s.switchService)]
  }
}
