# Astur Boilerplate

Starter mobile test suites for [Astur](https://github.com/Astur-mobile/Astur) —
the device-native automation framework with Playwright ergonomics and no Appium
server. Clone it, point it at your app, and start writing tests.

```bash
npm install
npx astur-mobile doctor
```

> **Note:** This starter focuses on **React Native** (and native) apps. Astur also
> supports **Flutter** — see the [main repo](https://github.com/Astur-mobile/Astur)
> and the [Flutter & React Native guide](https://astur-mobile.github.io/Astur/frameworks/)
> for Flutter setup. The starter tracks the latest published Astur
> (`@astur-mobile/test: latest`), so a fresh `npm install` always pulls the current release.

## Layout

| Path | What |
| --- | --- |
| `specs/` | Shared test files (login, forms, slider, swipe, drag & drop, tap laboratory, webview), the `fixtures.ts` app fixture, and `pages/` page objects — run on Android and iOS |
| `config/android/` | Android Playwright configs (single-device + a parallel config) |
| `config/ios/` | iOS Playwright config that runs the same shared specs on a simulator/device |
| `assets/` | Demo app binaries — committed so you can run immediately |

## Demo app

These suites target the Astur demo app, which ships in `assets/`:

- `assets/astur.demo.android.apk` — Android (used as-is)
- `assets/astur.demo.ios.simulator.zip` — iOS simulator build. Unzip it once:
  `unzip -o assets/astur.demo.ios.simulator.zip -d assets` → `assets/Astur.app`

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

## Run from VS Code (Playwright play button)

Astur is built on Playwright Test, so the **VS Code Playwright extension** works
out of the box — no separate CLI command needed. Open the **Testing** panel, or
click the green **▶** in the gutter next to a `test(...)`, to run or debug a spec
directly against a connected device or simulator. Fixtures, projects, retries,
and the trace viewer all behave like normal Playwright.

This is often the fastest loop for a single spec. The `npm run …` scripts above
are the equivalent for the terminal/CI.

> If `npm run doctor` reports `astur-mobile` not found, run `npm install` first —
> the CLI ships as the `astur-mobile` package on npm.

## License

Apache-2.0. "Astur" is a trademark — see the
[main repository](https://github.com/Astur-mobile/Astur) for the trademark
policy.
