# Migrating From v2 to v3

Version 3 of the plugin introduced major changes to how the plugin is configured. Configuration files from older versions will need to be updated.

## Existing Switches Will Be Deleted

This upgrade will cause all of the switches to be recreated. All old switches will be deleted. This means that **any automations, Shortcuts, and other references to the switches will stop working**. After upgrading, you will need to update all automations, Shortcuts, etc. to use the new switches.

## Log In

The plugin now includes a command line tool to log in to your Logitech account.

Run the following command to log in, following the prompts:

```sh-session
$ homebridge-logi-circle-controls login
```

If your Homebridge configuration path is non-standard, use the `-d` option to specify where it is.

Use the `-h` option to get additional help.

If you encounter issues, check the [wiki page](https://github.com/klanchman/homebridge-logi-circle-controls/wiki/How-to-Log-In) for more guidance.

## Configuration

The configuration of the plugin has changed significantly.

If you're upgrading from an older version, you should **delete** the following configuration properties:

- `email`
- `password`
- `accessories`
- `name`

If you want to globally rename switches to something other than the default names, use the `nameOverrides` property. Otherwise, you can rename switches in the Home app and the change will be remembered.