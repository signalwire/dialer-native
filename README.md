# SignalWire Dialer

A dialer application built with React Native that integrates with SignalWire for making and receiving calls with OAuth authentication.

- OAuth2 authentication via SignalWire Subscriber API
- Make and receive calls using SignalWire

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (>= 20)
- React Native development environment set up for your platform
- For detailed environment setup, follow the official React Native documentation:
  - [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)

We are using native modules unsupported by Expo.

- For iOS development, XCode must be installed and configured as per the guide.
- For Android development, Android Studio must be installed with the correct SDK version.

## Configuration

Authentication configuration is managed in `src/services/auth.ts`. Update the `AUTH_CONFIG` object with your SignalWire credentials:

```typescript
const AUTH_CONFIG = {
  issuer: 'https://id.fabric.signalwire.com/',
  serviceConfiguration: {
    authorizationEndpoint:
      'https://id.fabric.signalwire.com/login/oauth/authorize',
    tokenEndpoint: 'https://id.fabric.signalwire.com/oauth/token',
  },
  clientId: 'your-signalwire-client-id-here',
  redirectUrl: 'com.dialer://oauth-callback',
  clientAuthMethod: 'post' as const,
  scopes: [],
};
```

### Required Configuration

- `clientId` - Your SignalWire OAuth client ID (get this from SignalWire support)
- `redirectUrl` - OAuth redirect URL (default: `com.dialer://oauth-callback`)
- `issuer` - SignalWire Fabric OAuth issuer URL
- `authorizationEndpoint` - OAuth authorization endpoint
- `tokenEndpoint` - OAuth token endpoint

## Installation

1. Clone the repository and navigate to the project directory:

```bash
git clone https://github.com/signalwire/dialer-native
cd dialer-native
```

2. Install dependencies:

```bash
npm install
```

3. Update your SignalWire credentials in `src/services/auth.ts` (see Configuration section above)

4. (Optional) Update backend URL in `src/services/auth.ts`:
   - For iOS simulator: `http://localhost:3000/signup` (default)
   - For Android emulator: `http://10.0.2.2:3000/signup`
     Update to actual backend signup URL before publication.

### iOS Setup

1. Install CocoaPods dependencies:

```bash
cd ios
pod install
cd ..
```

2. Run the app:

```bash
npm run ios
```

### Android Setup

1. Make sure you have an Android emulator running or a device connected

2. Run the app:

```bash
npm run android
```

## Development

Run on iOS:

```bash
npm run ios
```

Run on Android:

```bash
npm run android
```
