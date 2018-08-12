# Homebridge Logitech Circle Controls

This is a Homebridge plugin that exposes extended controls for Logitech Circle cameras, such as toggles for privacy mode, camera on/off, and LED on/off.

## Installation

Tested with Node v8.9 and Homebridge v0.4.42.

```
npm i -g homebridge-logi-circle-privacy
```

## Configuration

In your Homebridge config.json file, add a new entry in `platforms` that looks like this:
```jsonc
{
    "platform": "Logi Circle Controls",
    "name": "<the desired name for the platform (mostly affects Homebridge logs)>",
    "deviceId": "<the ID of your camera>", /* See "Finding Your Device's ID" section */
    "email": "<the email for your Logitech Circle account>",
    "password": "<the password for your Logitech Circle account>",
    "accessories": [] /* See "Accessories" subsection */
}
```

### Accessories
In the above configuration, `accessories` is an array of accessories for this platform to control.

Currently, the available accessories are:
- Privacy mode switch (`type: privacyMode`)
- Camera on/off switch (`type: streamingMode`)
- LED on/off switch (`type: ledPower`)

If you wanted all available accessories to appear in your Home, the configuration would look like this:

```jsonc
"accessories": [{
    "type": "privacyMode",
    "name": "<the desired name for privacy mode switch>"
}, {
    "type": "streamingMode",
    "name": "<the desired name for camera on/off switch>"
}, {
    "type": "ledPower",
    "name": "<the desired name for LED on/off switch>"
}]
```

Of course, you can exclude any accessories that you do not want to have displayed in your Home.

## Finding Your Device's ID
Log into the web interface at https://circle.logi.com.

Once logged in and viewing a camera, the URL should be along the lines of `https://circle.logi.com/#/accessories/<ID>`. The ID in the URL is the device ID required in the platform config above.
