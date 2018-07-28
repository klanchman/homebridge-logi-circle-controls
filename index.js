module.exports = function(homebridge) {
  const injectedInformation = {
    Accessory: homebridge.platformAccessory,
    Service: homebridge.hap.Service,
    Characteristic: homebridge.hap.Characteristic,
    UUIDGen: homebridge.hap.uuid,
    packageInfo: {
      accessoryName: 'Logi Circle Privacy Mode Switch',
      version: require('./package.json').version,
    },
  }

  const LogiCircleControls = require('./lib/LogiCircleControls')(
    injectedInformation,
  )

  homebridge.registerAccessory(
    'homebridge-logi-circle-controls',
    injectedInformation.packageInfo.accessoryName,
    LogiCircleControls,
    true,
  )
}
