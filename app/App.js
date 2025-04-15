
import { useCallback, useEffect, useState } from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import * as SecureStore from "expo-secure-store"
import * as Sentry from "@sentry/react-native"
import * as Font from "expo-font"
import * as SplashScreen from "expo-splash-screen"
import { Asset } from "expo-asset"
import { AppRegistry, View, StyleSheet, Dimensions, Text, Image } from "react-native"
import { name as appName } from "./app.json"
import { Provider, useDispatch } from "react-redux"
import store from "./store/store"
import { fetchUserProfile } from "./store/slice/auth/user.slice"
import { ToastProvider } from "./context/ToastContext"
import { LocationProvider } from "./utils/Location"
import ErrorBoundary from "./ErrorBoundary"
import { StatusBar } from 'expo-status-bar';
// Import screens
import Home from "./screen/Home/Home"
import Onboarding from "./screen/onboarding/Onboarding"
import Register from "./screen/auth/Register/Register"
import Login from "./screen/auth/login/Login"
import AllCategories from "./components/categories/AllCategories"
import MainScreen from "./screen/C_AND_P_SCREENS/MainScreen"
import Contact from "./screen/Contact_us/Contact"
import Careers from "./screen/Careers/Careers"
import Shop from "./screen/Shop/Shop"
import Legal from "./screen/Legal/Legal"
import Cart from "./screen/Cart/Cart"
import Profile from "./screen/Profile/Profile"
import Orders from "./screen/Profile/Profile_Links_Screen/Orders"
import Address from "./screen/Profile/Profile_Links_Screen/Address"
import Billing from "./screen/Billing/Billing"
import Search from "./screen/Search/Search"
import Toast from "./screen/Search/toast"
import PaymentSuccessScreen from "./screen/Billing/PaymentSuccessScreen"
import PaymentFailedScreen from "./screen/Billing/PaymentFailedScreen"
import TestimonialSection from "./screen/Testimonials/TestimonialSection"
import NewsSection from "./screen/Testimonials/News/NewsSection"
import NewsDetail from "./screen/Testimonials/News/NewsDetail"
import AboutScreen from "./screen/About/AboutScreen"
import CancerLibrary from "./screen/Cancer/CancerLibrary"
import ProductInfo from "./screen/C_AND_P_SCREENS/Product/ProductInfo"
import MyPrescriptions from "./screen/Profile/Profile_Links_Screen/MyPrescriptions"
import Edit_Profile from "./screen/Profile/Profile_Links_Screen/Edit_Profile"

// Import assets
import logo from "./assets/logo/onco_health_mart_logo.png"
import AnimatedSplashScreen from "./components/SplashScreen/SplashScreen"
import AllCoupons from "./screen/Cart/AllCoupons"

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync()

const Stack = createNativeStackNavigator()
const { width, height } = Dimensions.get("window")

// Initialize Sentry
Sentry.init({
  dsn: "https://a9e4af59bcd9e0b6c828c72ef9a14453@o4508873810771970.ingest.us.sentry.io/4508885129822208",
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  enableInExpoDevelopment: __DEV__,
  debug: __DEV__,
  environment: __DEV__ ? "development" : "production",
  enableAutoSessionTracking: true,
  enableNative: true,
})


// App Loader Component
const AppLoader = ({ children }) => {
  const dispatch = useDispatch()
  const [isLoading, setIsLoading] = useState(true)
  const [initialRoute, setInitialRoute] = useState("Splash")
  const [appIsReady, setAppIsReady] = useState(false)

  useEffect(() => {
    const prepareApp = async () => {
      try {
        // Load fonts
        await Font.loadAsync({
          "ClashGrotesk-Variable": require("./assets/fonts/ClashGrotesk-Variable.ttf"),
        })

        // Check for token
        const tokenData = await SecureStore.getItemAsync("token")
        const token = tokenData ? JSON.parse(tokenData) : null

        // Pre-load images
        await Asset.loadAsync([logo])

        if (token) {
          // Fetch user profile if token exists
          await dispatch(fetchUserProfile())
          setTimeout(() => {
            setInitialRoute("Home")
          }, 3000)
        } else {
          // Check if onboarding was skipped
          const isSkip = await SecureStore.getItemAsync("isSkip")

          setTimeout(() => {
            setInitialRoute(isSkip === "true" ? "Home" : "login")
          }, 3000)

        }
      } catch (error) {
        console.error("Error during app preparation:", error)
        Sentry.captureException(error)
      } finally {
        setIsLoading(false)
        setAppIsReady(true)
      }
    }

    prepareApp()
  }, [dispatch])

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {

      await SplashScreen.hideAsync()
    }
  }, [appIsReady])

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync()
    }
  }, [isLoading])

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <Image source={logo} style={styles.loaderLogo} />
      </View>
    )
  }

  return children(initialRoute, onLayoutRootView)
}

const App = () => {
  const navigationRef = useNavigationContainerRef()

  return (
    <AppLoader>
      {(initialRoute, onLayoutRootView) => (
        <GestureHandlerRootView style={{ flex: 1 }}>
          <NavigationContainer ref={navigationRef} onReady={onLayoutRootView}>
            <Stack.Navigator initialRouteName={initialRoute}>
              <Stack.Screen name="Splash" options={{ headerShown: false }} component={AnimatedSplashScreen} />
              <Stack.Screen name="Home" options={{ headerShown: false }} component={Home} />
              <Stack.Screen name="Onboarding" options={{ headerShown: false }} component={Onboarding} />

              {/* Auth Screens */}
              <Stack.Screen name="register" options={{ headerShown: false }} component={Register} />
              <Stack.Screen name="login" options={{ headerShown: false }} component={Login} />

              {/* All Category Screens */}
              <Stack.Screen name="AllCategory" options={{ headerShown: false }} component={AllCategories} />
              <Stack.Screen name="Categorey-Page" options={{ headerShown: false }} component={MainScreen} />
              {/* <Stack.Screen name="Categorey-Page" options={{ headerShown: false }} component={MainScreen} /> */}
              // I am add u
              {/* Product Information Screens */}
              <Stack.Screen name="Product_info" options={{ headerShown: false }} component={ProductInfo} />

              {/* Contact us Information Screens */}
              <Stack.Screen
                name="Contact_us"
                options={{ headerShown: true, title: "Contact us" }}
                component={Contact}
              />
              <Stack.Screen name="Careers" options={{ headerShown: true, title: "Careers" }} component={Careers} />
              <Stack.Screen name="Shop" options={{ headerShown: false }} component={Shop} />

              {/* Legal us Information Screens */}
              <Stack.Screen name="Legal" options={{ headerShown: true, title: "Legal" }} component={Legal} />

              <Stack.Screen name="Cart" options={{ headerShown: false, title: "Cart" }} component={Cart} />
              <Stack.Screen name="Billing" options={{ headerShown: true, title: "Checkout" }} component={Billing} />
              <Stack.Screen
                name="Search_Page"
                options={{ headerShown: true, title: "Search Medicines" }}
                component={Search}
              />
              <Stack.Screen
                name="failed_screen"
                options={{ headerShown: false, title: "Profile" }}
                component={PaymentFailedScreen}
              />
              <Stack.Screen
                name="success-screen"
                options={{ headerShown: false, title: "Profile" }}
                component={PaymentSuccessScreen}
              />
              <Stack.Screen
                name="AllCoupons"
                options={{ headerShown: false, title: "Coupons" }}
                component={AllCoupons}
              />
              <Stack.Screen
                name="Cancer_Library"
                options={{ headerShown: false, title: "Cancer_Library" }}
                component={CancerLibrary}
              />

              <Stack.Screen
                name="Testimonials"
                options={{ headerShown: false, title: "Testimonials" }}
                component={TestimonialSection}
              />
              <Stack.Screen
                name="News"
                options={{ headerShown: false, title: "Testimonials" }}
                component={NewsSection}
              />
              <Stack.Screen
                name="NewsDetail"
                options={{ headerShown: false, title: "Testimonials" }}
                component={NewsDetail}
              />
              <Stack.Screen
                name="About"
                options={{ headerShown: true, title: "About Onco HealthMart" }}
                component={AboutScreen}
              />

              {/* Profile Screens */}
              <Stack.Screen name="Profile" options={{ headerShown: false, title: "Profile" }} component={Profile} />
              <Stack.Screen
                name="Edit-Profile"
                options={{ headerShown: false, title: "Profile" }}
                component={Edit_Profile}
              />
              <Stack.Screen name="Orders" options={{ headerShown: false, title: "Orders" }} component={Orders} />
              <Stack.Screen
                name="AddressBook"
                options={{ headerShown: false, title: "AddressBook" }}
                component={Address}
              />
              <Stack.Screen
                name="Prescriptions"
                options={{ headerShown: false, title: "Prescriptions" }}
                component={MyPrescriptions}
              />
            </Stack.Navigator>
          </NavigationContainer>
          <Toast navigation={navigationRef} />
        </GestureHandlerRootView>
      )}
    </AppLoader>
  )
}


const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0fffe",
  },
  loaderLogo: {
    width: width * 0.6,
    height: width * 0.2,
    resizeMode: "contain",
  }
})
// im a chage

const RootApp = () => (
  <ErrorBoundary>
    <Provider store={store}>
      <ToastProvider>
        <LocationProvider>
          <StatusBar style="dark" />
          <App />
        </LocationProvider>
      </ToastProvider>
    </Provider>
  </ErrorBoundary>
)

AppRegistry.registerComponent(appName, () => Sentry.wrap(RootApp))

export default RootApp

