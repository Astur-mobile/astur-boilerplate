import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@astur-mobile/test';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const iosDeviceId = process.env.ASTUR_IOS_DEVICE_ID;
const iosDeviceKind = process.env.ASTUR_IOS_DEVICE_KIND === 'real' ? 'real' : 'simulator';
const iosDeviceName = process.env.ASTUR_IOS_DEVICE_NAME ?? 'iPhone 16';
const iosBundleId = process.env.ASTUR_IOS_BUNDLE_ID ?? 'com.astur.demo';
const iosAppPath = process.env.ASTUR_IOS_APP_PATH;
const iosApp = iosAppPath
  ? {
    path: resolve(repoRoot, iosAppPath),
    bundleId: iosBundleId
  }
  : {
    bundleId: iosBundleId
  };
const iosDevice = iosDeviceKind === 'real'
  ? {
    kind: 'real' as const,
    ...(iosDeviceId ? { id: iosDeviceId } : {})
  }
  : iosDeviceId
    ? {
      kind: 'simulator' as const,
      id: iosDeviceId
    }
    : {
      kind: 'simulator' as const,
      name: iosDeviceName
    };

export default defineConfig({
  testDir: resolve(repoRoot, 'tests/demo-app'),
  // Deny-list, not an allow-list. Every spec runs on every platform by default,
  // exactly as the Android configs do; a platform only opts OUT, with a reason.
  // An allow-list silently drops newly added specs — a new spec then appears to
  // pass on iOS when it never ran at all.
  testIgnore: [
    // Native photo picker: system UI outside the app, not automatable here.
    'media-upload.test.ts',
    // WKWebView DOM needs ios-webkit-debug-proxy, which bridges physical
    // devices only — no CDP transport on the simulator yet.
    'webview.test.ts'
  ],
  timeout: 120_000,
  fullyParallel: false,
  workers: 1,
  outputDir: resolve(repoRoot, 'test-results/ios'),
  reporter: [
    ['list'],
    ['html', { outputFolder: resolve(repoRoot, 'playwright-report/ios'), open: 'never' }],
    ['junit', { outputFile: resolve(repoRoot, 'test-results/ios/results.xml') }]
  ],
  use: {
    trace: 'off',
    video: 'off',
    astur: {
      platform: 'ios',
      timeout: 15_000,
      artifacts: {
        screenshot: 'only-on-failure',
        video: 'retain-on-failure'
      },
      device: iosDevice,
      app: iosApp
    }
  }
});
