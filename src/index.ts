import { LogiCircleControlsPlatform } from './LogiCircleControlsPlatform'
import { HomebridgeAPI } from './utils/HomebridgeAPI'
import { PackageInfo } from './utils/PackageInfo'

export default (homebridge: Homebridge.API) => {
  HomebridgeAPI.configure(homebridge)

  homebridge.registerPlatform(
    'homebridge-logi-circle-controls',
    PackageInfo.platformName,
    LogiCircleControlsPlatform,
  )
}
