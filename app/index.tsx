import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Provider } from "react-redux"
import { NavigationContainer } from "@react-navigation/native"
import { store } from "../app/store"
import RootNavigator from "../app/navigation/RootNavigator"
import { ThemeProvider } from "./theme/ThemeContext" // Add ThemeProvider

export default function index() {
  return (
    <Provider store={store}>
      <ThemeProvider>
          <SafeAreaProvider>
            <StatusBar style="auto" />
            <RootNavigator />
          </SafeAreaProvider>
      </ThemeProvider>
    </Provider>
  )
}

