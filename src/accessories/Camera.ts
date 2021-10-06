import type { API, Logging } from 'homebridge'

import { LogiService } from '../LogiService'
import { Config } from '../utils/Config'
import { PackageInfo } from '../utils/PackageInfo'

import { AmbientLightSensor } from './AmbientLightSensor'
import { BaseSwitch } from './BaseSwitch'
import { CameraSwitch } from './CameraSwitch'
import { LEDSwitch } from './LEDSwitch'
import { NightVisionIRSwitch } from './NightVisionIRSwitch'
import { NightVisionModeSwitch } from './NightVisionModeSwitch'
import { RecordingSwitch } from './RecordingSwitch'

export class Camera {
  public readonly accessory
  public readonly uuid: string
  private switches: BaseSwitch[]
  private als

  constructor(
    private readonly deviceId: string,
    public readonly name: string,
    config: Config,
    private readonly api: API,
    private readonly log: Logging,
    private logiService: LogiService,
  ) {
    this.uuid = api.hap.uuid.generate(deviceId)

    this.accessory = new api.platformAccessory(name, this.uuid)

    this.switches = []

    const { Characteristic, Service } = api.hap

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const informationService = this.accessory.getService(
      Service.AccessoryInformation,
    )!

    informationService
      .setCharacteristic(Characteristic.Manufacturer, 'Kyle Lanchman')
      .setCharacteristic(Characteristic.Model, PackageInfo.platformName)
      .setCharacteristic(Characteristic.SerialNumber, 'None')
      .setCharacteristic(Characteristic.FirmwareRevision, PackageInfo.version)

    this.switches.push(
      new CameraSwitch(
        this.api,
        this.log,
        {
          name: config.nameOverrides.camera,
          deviceId,
        },
        this.logiService,
      ),
    )

    this.switches.push(
      new LEDSwitch(
        this.api,
        this.log,
        {
          name: config.nameOverrides.led,
          deviceId,
        },
        this.logiService,
      ),
    )

    this.switches.push(
      new RecordingSwitch(
        this.api,
        this.log,
        {
          name: config.nameOverrides.recording,
          deviceId,
        },
        this.logiService,
      ),
    )

    this.switches.push(
      new NightVisionModeSwitch(
        this.api,
        this.log,
        {
          name: config.nameOverrides.nightVisionMode,
          deviceId,
        },
        this.logiService,
      ),
    )

    this.switches.push(
      new NightVisionIRSwitch(
        this.api,
        this.log,
        {
          name: config.nameOverrides.nightVisionIR,
          deviceId,
        },
        this.logiService,
      ),
    )

    this.als = new AmbientLightSensor(
      this.api,
      this.log,
      {
        name: config.nameOverrides.lightSensor,
        deviceId,
      },
      this.logiService,
    )

    this.switches.forEach(s =>
      this.accessory.addService(s.switchService, s.subtype),
    )

    this.accessory.addService(this.als.alsService)
  }
}
