import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@astur-mobile/test';

// Flutter validation config for Android: the same shared demo-app suite, pointed
// at the Flutter build of the demo app (assets/astur.demo.android_flutter.apk)
// instead of the React Native build.
//
// Android drives Flutter through the Dart VM service, so two extra things are
// required (unlike iOS):
//   - the `flutter` CLI on PATH (or set ASTUR_FLUTTER_PATH), and
//   - ASTUR_FLUTTER_PROJECT pointing at the Flutter app's source directory
//     (the folder with pubspec.yaml).
//
//   ASTUR_FLUTTER_PROJECT=/path/to/flutter-app npm run test:android:flutter
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export default defineConfig({
  testDir: resolve(repoRoot, 'tests/demo-app'),
  timeout: 240_000,
  fullyParallel: false,
  workers: 1,
  outputDir: resolve(repoRoot, 'test-results/android-flutter'),
  reporter: [['list']],
  use: {
    trace: 'off',
    video: 'off',
    astur: {
      platform: 'android',
      timeout: 20_000,
      artifacts: {
        screenshot: 'only-on-failure',
        video: 'off'
      },
      device: {
        kind: 'emulator',
        avd: 'Pixel_9_API_35',
        autoBoot: true,
        headless: false,
        bootTimeout: 120_000
      },
      app: {
        path: resolve(repoRoot, 'assets/astur.demo.android_flutter.apk')
      },
      ...(process.env.ASTUR_ANDROID_AGENT_MODE
        ? { agent: { mode: process.env.ASTUR_ANDROID_AGENT_MODE as 'auto' | 'required' | 'off' } }
        : {})
    }
  }
});
