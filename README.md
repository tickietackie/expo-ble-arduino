# expo-ble-arduino
Example show casing a react native application with expo sending and reading data via Bluetooth Low Energy to an Arduino BLE

# Project Setup

```
npx create-expo-app@latest --template tabs@49
npx expo install react-native-ble-plx @config-plugins/react-native-ble-plx
npx expo install expo-device react-native-base64
npm i --save-dev @types/react-native-base64
npx expo install expo-dev-client
```

Add plugin in app.json 

```
[
    "@config-plugins/react-native-ble-plx",
    {
        "isBackgroundEnabled": true,
        "modes": ["peripheral", "central"],
        "bluetoothAlwaysPermission": "Allow $(PRODUCT_NAME) to connect to bluetooth devices"
    }
]
```

Add eas.json file with content:

```
{
    "build": {
        "development": {
        "developmentClient": true,
        "distribution": "internal" },
        "preview": {
            "distribution": "internal",
            "production":{}
        }
    }
}
```

install eas cli

`npx npm install eas-cli`

`npx expo prebuild`

install java v11 (on mac e.g. with `brew install openjdk@11`)

Android: `npx expo run:android`

iOS: `npx expo run:ios`

`eas build --profile development --platform ios`

Start the app and run the Arduino program on an Arduino BLE.
You now should be able to control its LED.