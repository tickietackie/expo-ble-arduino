/**
 * Sample BLE React Native App
 *
 * @format
 * @flow strict-local
 */

import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  FlatList,
  Pressable,
  Button,
  PermissionsAndroid,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";

import { requestPermissionOnAndroid } from "../../Permission";

import { BleManager, Descriptor, Device } from "react-native-ble-plx";
import base64 from "react-native-base64";

const getBleManager = () => {
  try {
    const manager = new BleManager();
    return manager;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const manager = getBleManager();

const connectToDevice = (device: Device) => {
  manager?.stopDeviceScan(); // stop scanning
  device
    .connect()
    .then((connectedDevice) => {
      console.log("connected");
      return connectedDevice.discoverAllServicesAndCharacteristics();
    })
    .then((connectedDevice) => {
      console.log("return services");
      return connectedDevice.services();
    })
    .then((services) => {
      // console.log(services);
      console.log("return characteristics");
      return services[0].characteristics();
    })
    .then((characteristics) => characteristics[0].read())
    .then((characteristic) => {
      console.log("read value");
      console.log(characteristic.value);
      console.log(
        base64.decode(characteristic.value ? characteristic.value : "")
      );
      console.log("write value");
      if (
        !characteristic.value ||
        parseInt(base64.decode(characteristic.value), 10) === 0
      ) {
        console.log("write 1");
        characteristic.writeWithResponse(base64.encode("1"));
      } else {
        console.log("write 0");
        characteristic.writeWithResponse(base64.encode("0"));
      }
    })
    .catch((error) => {
      console.error(error);
      Alert.alert("Fehler", error.message);
    });
};

const ToggleArduinoLed = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [list, setList] = useState<Device[] | []>([]);
  const [name, setName] = useState("test");
  const [arduinoFound, setArduinoFound] = useState<Device | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(true);

  React.useEffect(() => {
    console.log("use effect");
    manager?.onStateChange((state: any) => {
      console.log("onStateChange");
      const subscription = manager?.onStateChange((state: any) => {
        if (state === "PoweredOn") {
          // this && scanAndConnect();
          subscription.remove();
        }
      }, true);
      return () => subscription.remove();
    });
  }, [manager]);

  React.useEffect(() => {
    if (Platform.OS === "android") {
      (async () => {
        if ((await requestPermissionOnAndroid()) === true) {
          console.log("Permission granted");
          setPermissionGranted(true);
        } else {
          console.log("permission denied");
          setPermissionGranted(false);
        }
      })();
    }
  }, []);

  const scanAndConnect = () => {
    if (isScanning) {
      manager?.stopDeviceScan();
      setName("");
      setList([]);
      setIsScanning(false);
      setArduinoFound(null);
    } else {
      manager?.startDeviceScan(null, null, (error, device) => {
        setIsScanning(true);
        if (error) {
          // Handle error (scanning will be stopped automatically)
          console.error(error);
          return;
        }

        // Check if it is a device you are looking for based on advertisement data
        // or other criteria.
        console.log(device?.name, device?.localName, device?.id);
        let deviceName = device && device.name ? device.name : "Unnamed";
        const localName =
          device && device.localName ? device.localName : "Unnamed";
        deviceName = deviceName === "Unnamed" ? localName : deviceName;
        const id = device && device.id;
        const alreadyInList = list.find((data) => data.id === id);
        if (!alreadyInList && device) {
          const newList: Device[] = list;
          newList.push(device);
          setList(newList);
          setName(deviceName);
        }

        if (device?.localName === "LED" || device?.name === "LED") {
          setArduinoFound(device);
          setIsScanning(false);
          console.log("found device");
          // Stop scanning as it's not necessary if you are scanning for one device.
          manager?.stopDeviceScan();
          // Proceed with connection.
        }
      });
    }
  };

  const title = !isScanning ? "Search for Arduino" : "Stop search";

  return (
    <View style={styles.container}>
      {permissionGranted ? (
        <SafeAreaView style={styles.safeAreaContainer}>
          <View style={styles.buttonContainer}>
            <Button onPress={() => scanAndConnect()} title={title} />
          </View>
          <Text>{`Last found device: ${name}`}</Text>

          {isScanning ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator testID="Loading" size="large" color="red" />
            </View>
          ) : arduinoFound ? (
            <View>
              <Button
                title="Toggle LED"
                onPress={() => {
                  connectToDevice(arduinoFound);
                }}
              />
            </View>
          ) : (
            <View style={(styles.safeAreaContainer, styles.foundContainer)}>
              <Text>Arduino not found yet</Text>
            </View>
          )}
        </SafeAreaView>
      ) : (
        <Text>
          You need to provide me location permissions. This does not work
          otherwise. Now you have to reload ...
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: "2%",
    flex: 1,
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
  },
  safeAreaContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  foundContainer: {
    alignSelf: "center",
    justifyContent: "center",
    minHeight: "50%",
  },
  buttonContainer: {
    flexDirection: "row",
    marginBottom: "1%",
    justifyContent: "space-evenly",
    width: "100%",
  },
  item: {
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 10,
    shadowColor: "#000000",
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.75,
    shadowRadius: 2,
    elevation: 5,
    borderRadius: 5,
    minWidth: "80%",
  },
  title: {
    fontSize: 12,
  },
});

export default ToggleArduinoLed;
