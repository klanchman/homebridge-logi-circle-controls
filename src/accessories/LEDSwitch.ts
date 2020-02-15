import { BaseSwitch, SwitchConfig } from './BaseSwitch'
import LogiService = require('../LogiService')

export class LEDSwitch extends BaseSwitch {
  constructor(switchConfig: SwitchConfig, logiService: LogiService) {
    super(switchConfig, 'ledEnabled', logiService, 'led')
  }
}
