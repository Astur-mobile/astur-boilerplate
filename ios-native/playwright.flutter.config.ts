import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@astur-mobile/test';

// Flutter validation config for the iOS simulator: runs the shared demo-app suite
// (android-native/*.test.ts) against the Flutter build of the demo app instead of
// the React Native build. iOS reads Flutter through the XCUITest accessibility
// tree, so only the built simulator app is needed — no `flutter run` / Dart VM
// service.
//
// Provide the app as assets/Runner.app, extracted from the committed
// astur.demo.ios.simulator_flutter.zip:
//   unzip assets/astur.demo.ios.simulator_flutter.zip -d assets/
// Override ASTUR_IOS_APP_PATH to point at a fresh build.
//
// Excluded specs are iOS limitations, not framework bugs:
//  - webview.test.ts: Playwright drives WebViews over CDP, which iOS WKWebView
//    does not expose (the RN iOS config excludes it for the same reason).
//  - media-upload.test.ts: matches the RN iOS config's exclusion.
//  - drag-and-drop.test.ts: on the simulator only the first synthetic XCUITest
//    drag in a sequence registers with Flutter's pan recognizer, so the demo's
//    multi-piece solve cannot complete. It passes on the Flutter Android driver.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const appPath = process.env.ASTUR_IOS_APP_PATH ?? resolve(repoRoot, 'assets/Runner.app');
const bundleId = process.env.ASTUR_IOS_BUNDLE_ID ?? 'com.astur.demo';
const deviceId = process.env.ASTUR_IOS_DEVICE_ID;
const deviceName = process.env.ASTUR_IOS_DEVICE_NAME ?? 'iPhone 16';
const device = deviceId
  ? { kind: 'simulator' as const, id: deviceId }
  : { kind: 'simulator' as const, name: deviceName };

export default defineConfig({
  testDir: resolve(repoRoot, 'android-native'),
  testMatch: [
    'login.test.ts',
    'forms.test.ts',
    'forms-slider.test.ts',
    'orientation-menu.test.ts',
    'swipe.test.ts',
    'tap-laboratory.test.ts'
  ],
  timeout: 180_000,
  fullyParallel: false,
  workers: 1,
  outputDir: resolve(repoRoot, 'test-results/ios-flutter'),
  reporter: [['list']],
  use: {
    trace: 'off',
    video: 'off',
    astur: {
      platform: 'ios',
      timeout: 20_000,
      artifacts: {
        screenshot: 'only-on-failure',
        video: 'off'
      },
      device,
      app: { path: appPath, bundleId }
    }
  }
});
