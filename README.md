# Astur Boilerplate

Starter mobile test suites for [Astur](https://github.com/Astur-mobile/Astur) —
the device-native automation framework with Playwright ergonomics and no Appium
server. Clone it, point it at your app, and start writing tests.

```bash
npm install
npx astur-mobile doctor
```

> **Note:** This starter includes React Native/native demo suites and optional
> Flutter demo configs. It tracks the latest published Astur
> (`@astur-mobile/test: latest`), so a fresh `npm install` always pulls the
> current release.

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

### Network observation

`device.network` reports the app's HTTP traffic. Coverage differs by build, so a
spec asks `capabilities()` first and skips with a reason rather than failing —
which is why the release suite above passes without observing anything.

```bash
npm run test:android:rn-debug   # React Native debug build attached to Metro
npm run test:ios:rn-debug
npm run test:android:flutter    # Flutter debug/profile build
npm run test:ios:flutter
```

React Native's CDP network reporter is compiled out of release builds, so the
shipped `assets/astur.demo.android.apk` cannot observe traffic. Run a **debug**
build against Metro instead — in the demo-app repo, `npx expo start` then
`npx expo run:android` (or `npx expo run:ios`; iOS needs no app-side change).

Coverage is `XMLHttpRequest` traffic — React Native's own `fetch` polyfill and
`axios` included, because both bottom out there. **Expo's native `fetch` is
invisible**: it is implemented natively and bypasses React Native's networking
module entirely.

Flutter reads the Dart VM's HTTP profiler and likewise needs a debug or profile
build — a release AOT build publishes no VM service on either platform.

### Visual comparison

`toHaveScreenshot()` compares an element or the whole screen against a stored
baseline. Baselines are kept per platform, renderer, and screen size:

```
tests/demo-app/visual-comparison.test.ts-snapshots/
  android-native-1080x2424/   android-flutter-1080x2424/
  ios-native-393x852/         ios-flutter-393x852/
```

The first run for a new device writes a baseline and **fails** on purpose — a
run that quietly creates one has asserted nothing. Check the image, commit it,
and the next run compares. To accept an intended change, re-run with `-u`.

> **Recording iOS baselines:** pass `ASTUR_IOS_APP_FORCE_INSTALL=1`. iOS skips
> installing when the bundle id is already present, and the React Native and
> Flutter demo builds share `com.astur.demo` — so without it you can record one
> build's pixels under the other's name. Android configs already force-install.

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

### Mobile web (browser)

`device.browser` drives a page in the device's **own browser** — Chrome on
Android, Safari on iOS — rather than a WebView inside an app. It is the other
half of the web story above: `device.webContext()` tests your app's web screens,
`device.browser` tests a website on real mobile browsers.

```bash
npm run test:android:browser
npm run test:ios:browser
```

> **Not in a published release yet.** The browser suite needs a release newer
> than `@astur-mobile/test` 0.5.0-beta.5. Until that is on npm the two scripts
> above will fail on `device.browser` being undefined — the specs and configs are
> here so they arrive with the release, not after it.

These configs set `browser` and no `app`, which makes a **browser-only session**:
Astur skips app install and treats the native agent as optional. On iOS that is
the difference between opening a page and needing an Xcode signing identity
first — so this suite needs no demo binary at all.

```ts
use: { astur: { platform: 'android', browser: { engine: 'chrome' } } }
```

The page under test is served from `assets/web/` by the config's `webServer`, so
the suite runs offline. Android needs Chrome **past its first-run screen** — until
that welcome flow is done Chrome publishes no debugging socket, reported as
`BROWSER_FIRST_RUN_PENDING` rather than a timeout. iOS needs
`ios-webkit-debug-proxy`; the simulator needs nothing else.

Worth knowing before you build a suite on it: a tab is **not** a Playwright
browser context, so cookies and `localStorage` are shared across the profile —
clear what a test depends on. iOS reuses one tab (WebKit exposes no tab
lifecycle), the browser's own chrome is native UI rather than page content, and
the real-iOS path is written but not yet verified on hardware.

Playwright already tests mobile web well through device emulation, and it is
faster in CI. Reach for this when emulation is not what you need: a real mobile
browser, on the same device pool, in the same run as your native suite.

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
