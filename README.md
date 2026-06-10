# Astur Boilerplate

Starter mobile test suites for [Astur](https://github.com/Astur-mobile/Astur) —
the device-native automation framework with Playwright ergonomics and no Appium
server. Clone it, point it at your app, and start writing tests.

```bash
npm install
npx astur-mobile doctor
```

## Layout

| Path | What |
| --- | --- |
| `android-native/` | Android suites: login, forms, slider, swipe, drag & drop, tap laboratory, webview, plus a parallel config |
| `ios-native/` | iOS config that runs the shared Android-authored specs on a simulator/device |
| `assets/` | Where the demo app binaries go (git-ignored — see below) |

## Demo app

These suites target the Astur demo app. Download the build artifacts from
[`Astur-mobile/astur-demoApp`](https://github.com/Astur-mobile/astur-demoApp)
and place them in `assets/`:

- `assets/astur.demo.android.apk`
- `assets/Astur.app` (iOS simulator) and/or `assets/astur.demo.ios.ipa` (real device)

To test your **own** app instead, change `use.astur.app` in the relevant
`playwright.config.ts` and update the locators in the specs.

## Run

```bash
npm run doctor                  # environment check
npm run devices                 # list connected devices
npm run test:android            # Android suite (boots Pixel_9_API_35 if offline)
npm run test:ios                # iOS simulator (iPhone 16 by default)
npm run test:parallel           # Android + iOS concurrently
npm run codegen:android:emulator  # record a new spec
```

iOS device selection is environment-driven:

```bash
ASTUR_IOS_DEVICE_KIND=real ASTUR_IOS_DEVICE_ID=<udid> npm run test:ios
ASTUR_IOS_APP_PATH=assets/astur.demo.ios.ipa npm run test:ios:real
```

## License

Apache-2.0. "Astur" is a trademark — see the
[main repository](https://github.com/Astur-mobile/Astur) for the trademark
policy.
