# Shared Demo App Suite

This shared suite expects:

- platform config under `configs/android/`, `configs/ios/`, or `configs/mobile/`
- the matching demo app binary under `assets/`
- the required Android emulator, iOS simulator, or real device for the selected config

For Android, Astur defaults to the v2 native-agent engine in migration-safe `auto` mode, installs and starts the Android agent automatically, and keeps the low-level automation settings out of the example config. Set an explicit endpoint only when you are attaching to an already-running agent:

```bash
export ASTUR_ANDROID_AGENT_ENDPOINT=tcp:127.0.0.1:8787
```

Advanced projects can still override the engine in `use.astur.automation`, for example `engine: 'agent'` to fail fast in CI or `engine: 'legacy-adb'` when intentionally comparing against the old shell/XML path.

Run the full feature suite from this repository root after building:

```bash
npm run build
npm run test:android
```

Astur now keeps one native agent session per Playwright worker instead of recreating it for every spec. The demo `app` fixture terminates and relaunches the app before each test, so tests remain isolated without reinstalling the native agent or clearing app data on every spec. Android also skips redundant agent APK installs when the agent packages are already present on the device; set `ASTUR_ANDROID_AGENT_FORCE_INSTALL=1` only when you intentionally want to refresh the installed agent APKs.

Astur skips redundant app installs when the configured app is already installed on the target device. The first run installs normally; later sessions reuse the installed package unless you uninstall it.

The suite is split by user-facing functionality:

- `login.test.ts` covers credentials and login feedback.
- `forms.test.ts` covers text input, switch, checkbox, and form button state.
- `forms-slider.test.ts` covers the form slider bar and value updates.
- `keyboard-focus.test.ts` covers typing into the focused control and printable-character `pressKey` behavior. It requires `@astur-mobile/test` 0.5.0-beta.4 or newer; the repository's `latest` dependency will resolve it after that release is published.
- `media-upload.test.ts` covers selecting a media file from the form screen.
- `tap-laboratory.test.ts` covers single tap, double tap, and long press on Android. The current iOS demo IPA exposes the same counters, but XCTest double taps are reported by the app as two single taps on real hardware, so the iOS assertion records that platform behavior until the demo app gesture handler is updated.
- `orientation-menu.test.ts` verifies that a landscape smoke action always restores portrait for the next test.
- `swipe.test.ts` covers carousel and vertical swipe behavior.
- `drag-and-drop.test.ts` covers the drag puzzle.
- `webview.test.ts` covers native WebView navigation plus DOM interaction.
- `browser.test.ts` covers `device.browser` — driving a page in the device's own browser (Chrome on Android, Safari on iOS) rather than a WebView inside an app. It runs under its own configs (`configs/android/browser.config.ts`, `configs/ios/browser.config.ts`), which set `browser` and no `app`, so the session installs nothing and needs no demo binary. Requires a release newer than `@astur-mobile/test` 0.5.0-beta.5; the repository's `latest` dependency will resolve it once that release is published.

  The page under test is served from `assets/web/` by the config's `webServer`, so the suite stays offline — no public site can change its markup and fail a run. The device reaches the host at `10.0.2.2` from an Android emulator and `127.0.0.1` from an iOS simulator; the spec spells that difference out rather than hiding it.

  Two things to know before building on it. A tab is **not** a Playwright browser context — cookies and `localStorage` belong to the browser profile and are shared, so clear what a test depends on rather than assuming a fresh tab did. And Chrome must be past its first-run welcome screen, or it publishes no debugging socket at all; Astur reports that as `BROWSER_FIRST_RUN_PENDING` instead of timing out.
- `native-locators.test.ts` covers platform-native selectors for the cases the cross-platform locators cannot express.
- `network-observation.test.ts` covers `device.network` — asserting on the HTTP calls the app makes, not just what it renders. It asks `capabilities()` first and skips with a reason where observation is unavailable, so it is safe to run on every platform.
- `visual-comparison.test.ts` covers `toHaveScreenshot()` — comparing an element against a committed baseline, and masking a region that is allowed to change. Requires a release newer than `@astur-mobile/test` 0.5.0-beta.4; the repository's `latest` dependency will resolve it once that release is published.

  Its baselines live in `visual-comparison.test.ts-snapshots/`, one directory per device (`android-native-1080x2424`, `android-flutter-1080x2424`, `ios-native-393x852`). They were recorded on a Pixel 9 emulator and an iPhone 16 simulator. On a different device the first run writes new baselines and fails, telling you to check and commit them — that is the intended flow, not a broken test.

Run one focused feature:

```bash
npm run test:android -- tests/demo-app/tap-laboratory.test.ts
```

All demo-app specs use the same page object model:

- `fixtures.ts` turns Astur's built-in `device` fixture into an `app` fixture.
- `pages/astur-demo-app.page.ts` contains the single page-object file for the demo app.
- Test files stay focused on expected behavior and call page methods such as `app.login.enterCredentials()` and `app.forms.chooseFirstVisibleMedia()`.
- The `app` fixture performs the per-spec app restart, so individual specs do not need repeated `app.reset()` boilerplate.

Run the WebView feature:

```bash
npm run test:android -- tests/demo-app/webview.test.ts
```

Run the cross-platform suite against one Android device and one iOS simulator in parallel:

```bash
adb devices -l
xcrun simctl list devices booted
npm run test:parallel -- tests/demo-app/login.test.ts
```

To filter both by file and project, place the file path before `--project` because Playwright's `--project` option accepts multiple values:

```bash
npm run test:parallel -- tests/demo-app/login.test.ts --project ios-simulator
```

The parallel config maps projects to separate platforms:

- `android-device` -> `ASTUR_ANDROID_DEVICE_ID` or `emulator-5554`
- `ios-simulator` -> `ASTUR_IOS_DEVICE_ID` or `ASTUR_IOS_DEVICE_NAME` or `iPhone 16`

Keep these ids aligned with `adb devices -l` and `xcrun simctl list devices`. Each parallel project must select a different device. Astur reserves the selected device per Playwright worker and fails fast if another worker tries to control the same device at the same time.

Each project gets an isolated Astur session and its own native artifact directory. The two device workers run at the same time; when one device finishes, its session closes without waiting for the other device's test steps. The Playwright command itself still exits only after all project results are collected so it can produce one combined report.

Keep device-level parallel runs project-based. Do not point two projects at the same emulator id, and do not enable unrestricted file-level parallelism for multiple specs targeting the same physical device. In the parallel config, each mobile project sets `workers: 1` while the top-level config uses `workers: 2`; that allows Android and iOS to run at the same time without allowing two Android specs or two iOS specs to fight over the same device.

The example package intentionally exposes only `npm run test:parallel` for the mixed-platform run. Running one selected Android or iOS project from the parallel config is just a serial single-device run, so use `npm run test:android` or `npm run test:ios` for that case.

The default single-device config uses `workers: 1` for this reason. Use `configs/mobile/parallel.config.ts` when each worker targets a different Android or iOS device.

The example config writes:

- HTML report: `playwright-report/android`
- JUnit XML: `test-results/android/results.xml`
- native screenshots/videos: attached to the Playwright report from `use.astur.artifacts`

Playwright tracing is off in this native-only example because the Playwright trace viewer records browser/page snapshots, which appear as `about:blank` for native mobile screens. Keep native screenshots, videos, timing diagnostics, and error context as the default debugging surface; enable Playwright traces only for specs that use WebView DOM automation.

Element waits come from `use.astur.timeout`; add `{ timeout: ... }` to an individual locator only when that element needs a different budget.

Soft-keyboard handling comes from `use.astur.keyboard.dismiss`. The examples use `auto`, so locator and coordinate actions dismiss the keyboard only when it blocks the target point. Use `{ keyboard: 'preserve' }` on an individual action when you intentionally need to interact with the keyboard.

For WebView screens, keep native and DOM automation separate. Use native Astur locators to navigate to the Web tab, then request a Playwright-backed WebView page:

```ts
test('webview DOM', async ({ app, webview }) => {
  await app.nav.open('web');

  const web = await webview({ timeout: 30_000 });
  await expect(web.page.locator('body')).toContainText(/Astur Web Lab/);
});
```

Android WebView DOM control requires WebView debugging to be enabled by the app. Native interactions still use `device.find(...)`; WebView DOM interactions use `web.page`.
