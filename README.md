# AnyCard Magic

A React Native application that displays an interactive lock screen with a card trick functionality.

## Features

- Digital clock design inspired by the Pixel 9 lock screen
- Interactive playing card trick
- Touch any corner of the screen to select a suit
- Tap the card to dismiss it
- Drag the card to move it around

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YoussefSanad/AnyCard.git
   cd AnyCard
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## Running on Web

To run the app in your browser for quick development:

1. Start the development server with web platform enabled:
   ```bash
   npx expo start --web
   ```

2. The app should automatically open in your default browser. If not, you can open:
   ```
   http://localhost:19006
   ```

3. Use Chrome DevTools (F12) to simulate different device sizes and orientations.

## Running on Android (Debug Mode)

### Using Expo Go (Easiest Method)

1. Install the Expo Go app on your Android device from the [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent).

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Scan the QR code with the Expo Go app on your Android device.

### Using Local Development Build

For a more advanced setup with full debugging capabilities:

1. Make sure you have Android Studio installed with Android SDK.

2. Connect your Android device via USB and enable USB debugging in developer options.

3. Check if your device is recognized:
   ```bash
   adb devices
   ```

4. Create a development build:
   ```bash
   npx expo run:android
   ```

5. The app will be installed and launched on your Android device in debug mode.

### Building APK for Testing

To create a debug APK you can share with others for testing:

1. Navigate to the Android directory:
   ```bash
   cd android
   ```

2. Build the debug APK:
   ```bash
   ./gradlew assembleDebug
   ```

3. The APK will be generated at:
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

4. Install on a connected device:
   ```bash
   adb install -r app/build/outputs/apk/debug/app-debug.apk
   ```

## Troubleshooting

- If you encounter build errors, try cleaning the project:
  ```bash
  cd android && ./gradlew clean
  ```

- For Android SDK related issues, ensure you have the correct SDK versions installed through Android Studio's SDK Manager:
  - Android SDK Platform 33 (or the version specified in `android/build.gradle`)
  - Android SDK Build-Tools 33.0.0 (or corresponding version)
  
- If Metro bundler hangs, try clearing the cache:
  ```bash
  npx expo start --clear
  ```

- For more detailed logs, run:
  ```bash
  npx expo start --dev-client --verbose
  ```

## Performance Tips

- Enable "Fast Refresh" in the Expo developer menu for quicker development
- Use release mode when testing performance (`--no-dev` flag)
- Ensure "Keep Awake" is enabled during development

## License

MIT
