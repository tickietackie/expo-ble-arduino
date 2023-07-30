import { Redirect } from "expo-router";
// eslint-disable-next-line @typescript-eslint/no-unused-vars

/*
import de from "./resource/locales/de";
import en from "./resource/locales/en";


/*Th 118n API is mostly synchronous and driven by constants.
On iOS the constants will always be correct, on Android you should check if the locale has updated using AppState and Localization.getLocalizationAsync().
Initially the constants will be correct on both platforms, but on Android a user can change the language and return.
*/

export default function StartPage() {
  return <Redirect href="/home/ToggleArduinoLed"></Redirect>;
}
