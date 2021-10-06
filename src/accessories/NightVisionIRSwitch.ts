import type { API, Logging } from 'homebridge'

import { LogiService } from '../LogiService'

import { BaseSwitch, SwitchConfig } from './BaseSwitch'

export class NightVisionIRSwitch extends BaseSwitch {
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
      'nightVisionIrLedsEnabled',
      logiService,
      'nightVisionIR',
    )
  }
}
