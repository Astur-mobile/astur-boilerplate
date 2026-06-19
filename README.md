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
| `tests/demo-app/` | Shared demo-app specs, fixtures, and page objects used across platform/framework configs |
| `configs/android/` | Android React Native and Flutter Playwright configs |
| `configs/ios/` | iOS React Native and Flutter Playwright configs |
| `configs/mobile/` | Mixed-platform Playwright config for Android + iOS parallel runs |
| `assets/` | Demo app binaries — committed so you can run immediately |

## Demo app

These suites target the Astur demo app, which ships in `assets/`:

- `assets/astur.demo.android.apk` — Android (React Native build, used as-is)
- `assets/astur.demo.ios.simulator.zip` — iOS simulator build. Unzip it once:
  `unzip -o assets/astur.demo.ios.simulator.zip -d assets` → `assets/Astur.app`
- `assets/astur.demo.android_flutter.apk` — Android (Flutter build)
- `assets/astur.demo.ios.simulator_flutter.zip` — iOS simulator (Flutter build).
  Unzip once: `unzip -o assets/astur.demo.ios.simulator_flutter.zip -d assets` →
  `assets/Runner.app`

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

### Flutter

The same specs drive the Flutter build of the demo app:

```bash
npm run test:ios:flutter        # iOS simulator (uses assets/Runner.app)
ASTUR_FLUTTER_PROJECT=/path/to/flutter-app npm run test:android:flutter
```

Android Flutter reads the live widget tree through the Dart VM service, so it
needs `ASTUR_FLUTTER_PROJECT` (the Flutter app's source dir with `pubspec.yaml`)
and the `flutter` CLI on `PATH`. iOS Flutter reads the XCUITest accessibility
tree — no extra setup beyond `assets/Runner.app`. A few specs are
platform-limited on iOS Flutter (drag-and-drop, media-upload, webview).

### WebViews (DOM)

In-app WebViews are automated at the DOM level with `device.webContext()` — the
same API for Flutter and React Native:

```ts
const web = await device.webContext();
await web.getById('astur-email').fill('qa@astur.dev');
await web.getByTestId('astur-submit').tap();
```

Works on Android (Chromium WebView/CDP) and real iOS devices
(`brew install ios-webkit-debug-proxy`, `WKWebView.isInspectable = true`). The
iOS Simulator is not yet supported for web DOM.

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
