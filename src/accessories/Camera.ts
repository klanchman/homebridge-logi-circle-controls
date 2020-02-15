import { Service } from 'hap-nodejs'
import { AccessoryInformation } from 'hap-nodejs/dist/lib/gen/HomeKit'
import LogiService from '../LogiService'
import { AccessoryConfig } from '../utils/Config'
import { HomebridgeAPI } from '../utils/HomebridgeAPI'
import { Logger } from '../utils/Logger'
import { PackageInfo } from '../utils/PackageInfo'
import { BaseSwitch } from './BaseSwitch'
import { CameraSwitch } from './CameraSwitch'
import { LEDSwitch } from './LEDSwitch'
import { NightVisionIRSwitch } from './NightVisionIRSwitch'

const NightVisionModeSwitch = require('./NightVisionModeSwitch')
const RecordingSwitch = require('./RecordingSwitch')

export class Camera {
  private informationService: AccessoryInformation
  private switches: BaseSwitch[]

  constructor(config: AccessoryConfig, private logiService: LogiService) {
    this.switches = []

    const Characteristic = HomebridgeAPI.shared.Characteristic

    const f = new Service.AccessoryInformation(config.name, '')

    this.informationService = new Service.AccessoryInformation(config.name, '')
    this.informationService
      .setCharacteristic(Characteristic.Manufacturer, 'Kyle Lanchman')
      .setCharacteristic(Characteristic.Model, PackageInfo.platformName)
      .setCharacteristic(Characteristic.SerialNumber, 'None')
      .setCharacteristic(Characteristic.FirmwareRevision, PackageInfo.version)

    if (!config.camera.disabled) {
      this.switches.push(
        new CameraSwitch(
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
        new RecordingSwitch({
          switchConfig: {
            name: config.recording.name,
            deviceId: config.deviceId,
          },
          Service,
          Characteristic,
          logiService: this.logiService,
          log: Logger.shared,
        }),
      )
    }

    if (!config.nightVisionMode.disabled) {
      this.switches.push(
        new NightVisionModeSwitch({
          switchConfig: {
            name: config.nightVisionMode.name,
            deviceId: config.deviceId,
          },
          Service,
          Characteristic,
          logiService: this.logiService,
          log: Logger.shared,
        }),
      )
    }

    if (!config.nightVisionIR.disabled) {
      this.switches.push(
        new NightVisionIRSwitch(
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
