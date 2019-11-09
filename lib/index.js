module.exports = function(homebridge) {
  const injectedInformation = {
    Accessory: homebridge.platformAccessory,
    Service: homebridge.hap.Service,
    Characteristic: homebridge.hap.Characteristic,
    UUIDGen: homebridge.hap.uuid,
    packageInfo: {
      platformName: 'Logi Circle Controls',
      version: require('../package.json').version,
    },
  }

  const LogiCircleControls = require('./LogiCircleControlsPlatform')(
    injectedInformation,
  )

  homebridge.registerPlatform(
    'homebridge-logi-circle-controls',
    injectedInformation.packageInfo.platformName,
    LogiCircleControls,
  )
}
