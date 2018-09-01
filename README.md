# Homebridge Logitech Circle Controls

This is a Homebridge plugin that exposes extended controls for Logitech Circle cameras, such as toggles for privacy mode, camera on/off, and LED on/off.

## Installation

Tested with Node v8.9 and Homebridge v0.4.42.

```
npm i -g homebridge-logi-circle-controls
```

## Finding Your Device's ID

You'll need to know the ID of your device(s) to configure this plugin.

Log into the web interface at https://circle.logi.com.

Once logged in and viewing a camera, the URL should be along the lines of `https://circle.logi.com/#/accessories/<ID>`. The ID in the URL is the device ID required in the config objects above.

## Configuration

In your Homebridge config.json file, add a new entry in `platforms` that looks like this:

```jsonc
{
  "platform": "Logi Circle Controls",
  "name": "<the desired name for the platform (mostly affects Homebridge logs)>",
  "email": "<the email for your Logitech Circle account>",
  "password": "<the password for your Logitech Circle account>",
  "defaultDeviceId": "<Optional: the ID of your camera (useful if you only have 1 device)>",
  "accessories": [] /* See "Accessories" subsection */
}
```

### Accessories

In the above configuration, `accessories` is an array of accessories for this platform to control.

Currently, the available accessories are:

- Privacy mode switch (`type: privacyMode`)
- Camera on/off switch (`type: streamingMode`)
- LED on/off switch (`type: ledPower`)

An accessory config object looks like this:

```jsonc
{
  "type": "<an accessory type>",
  "name": "<the desired name for privacy mode switch (appears in the Home app)>",
  "deviceId": "<Optional: the ID of your camera. If not specified, uses `defaultDeviceId` from platform config>"
}
```

An example configuration for all available accessory that uses a `defaultDeviceId` might look like this:

```jsonc
{
  "accessories": [
    {
      "type": "privacyMode",
      "name": "Privacy Mode"
    },
    {
      "type": "streamingMode",
      "name": "Steaming Mode"
    },
    {
      "type": "ledPower",
      "name": "LED Power"
    }
  ]
}
```

Of course, you can exclude any accessories that you do not want to have displayed in your Home.
