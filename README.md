# Homebridge Logitech Circle Privacy Switch

This is a Homebridge plugin that exposes a switch accessory that controls the "privacy mode" toggle for Logitech Circle cameras.

## Installation

Tested with Node v8.9 and Homebridge v0.4.42.

```
npm i -g homebridge-logi-circle-privacy
```

## Configuration

In your Homebridge config.json file, add a new entry in `accessories` that looks like this:
```json
{
    "accessory": "Logi Circle Privacy Mode Switch",
    "name": "<what you want the switch called>",
    "deviceId": "<the ID of your camera, see next section>",
    "email": "<the email for your Logitech Circle account>",
    "password": "<the password for your Logitech Circle account>"
}
```

## Finding Your Device's ID
Log into the web interface at https://circle.logi.com.

Once logged in and viewing a camera, the URL should be along the lines of `https://circle.logi.com/#/accessories/<ID>`. The ID in the URL is the device ID required in the accessory config above.
