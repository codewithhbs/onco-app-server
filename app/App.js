import React,{ useCallback, useEffect, useState, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SecureStore from "expo-secure-store";
import * as Sentry from "@sentry/react-native";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { Asset } from "expo-asset";
import { AppRegistry, View, StyleSheet, Dimensions, Image, Platform } from "react-native";
import { name as appName } from "./app.json";
import { Provider } from "react-redux";
import store from "./store/store";
import { fetchUserProfile } from "./store/slice/auth/user.slice";
import { ToastProvider } from "./context/ToastContext";
import { LocationProvider } from "./utils/Location";
import ErrorBoundary from "./ErrorBoundary";
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';

// Import logo asset
import logo from "./assets/logo/onco_health_mart_logo.png";

// Import screens
import AnimatedSplashScreen from "./components/SplashScreen/SplashScreen";
import Home from "./screen/Home/Home";
import Onboarding from "./screen/onboarding/Onboarding";
import Register from "./screen/auth/Register/Register";
import Login from "./screen/auth/login/Login";
import AllCategories from "./components/categories/AllCategories";
import MainScreen from "./screen/C_AND_P_SCREENS/MainScreen";
import Contact from "./screen/Contact_us/Contact";
import Careers from "./screen/Careers/Careers";
import Shop from "./screen/Shop/Shop";
import Legal from "./screen/Legal/Legal";
import Cart from "./screen/Cart/Cart";
import Profile from "./screen/Profile/Profile";
import Orders from "./screen/Profile/Profile_Links_Screen/Orders";
import Address from "./screen/Profile/Profile_Links_Screen/Address";
import Billing from "./screen/Billing/Billing";
import Search from "./screen/Search/Search";
import Toast from "./screen/Search/toast";
import PaymentSuccessScreen from "./screen/Billing/PaymentSuccessScreen";
import PaymentFailedScreen from "./screen/Billing/PaymentFailedScreen";
import TestimonialSection from "./screen/Testimonials/TestimonialSection";
import NewsSection from "./screen/Testimonials/News/NewsSection";
import NewsDetail from "./screen/Testimonials/News/NewsDetail";
import AboutScreen from "./screen/About/AboutScreen";
import CancerLibrary from "./screen/Cancer/CancerLibrary";
import ProductInfo from "./screen/C_AND_P_SCREENS/Product/ProductInfo";
import MyPrescriptions from "./screen/Profile/Profile_Links_Screen/MyPrescriptions";
import Edit_Profile from "./screen/Profile/Profile_Links_Screen/Edit_Profile";
import AllCoupons from "./screen/Cart/AllCoupons";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  /* ignore error */
});

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
});

const Stack = createNativeStackNavigator();
const { width, height } = Dimensions.get("window");

// Memoized screen components
const MemoizedScreens = {
  Splash: React.memo(AnimatedSplashScreen),
  Home: React.memo(Home),
  Onboarding: React.memo(Onboarding),
  Register: React.memo(Register),
  Login: React.memo(Login),
  AllCategory: React.memo(AllCategories),
  CategoryPage: React.memo(MainScreen),
  ProductInfo: React.memo(ProductInfo),
  Contact: React.memo(Contact),
  Careers: React.memo(Careers),
  Shop: React.memo(Shop),
  Legal: React.memo(Legal),
  Cart: React.memo(Cart),
  Profile: React.memo(Profile),
  EditProfile: React.memo(Edit_Profile),
  Orders: React.memo(Orders),
  AddressBook: React.memo(Address),
  Billing: React.memo(Billing),
  SearchPage: React.memo(Search),
  FailedScreen: React.memo(PaymentFailedScreen),
  SuccessScreen: React.memo(PaymentSuccessScreen),
  AllCoupons: React.memo(AllCoupons),
  CancerLibrary: React.memo(CancerLibrary),
  Testimonials: React.memo(TestimonialSection),
  News: React.memo(NewsSection),
  NewsDetail: React.memo(NewsDetail),
  About: React.memo(AboutScreen),
  Prescriptions: React.memo(MyPrescriptions),
};

// Custom navigator that prevents unnecessary re-renders
const MemorizedNavigator = React.memo(({ initialRoute, ...props }) => {
  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ animationEnabled: false }}>
      <Stack.Screen name="Splash" options={{ headerShown: false }} component={MemoizedScreens.Splash} />
      <Stack.Screen name="Home" options={{ headerShown: false }} component={MemoizedScreens.Home} />
      <Stack.Screen name="Onboarding" options={{ headerShown: false }} component={MemoizedScreens.Onboarding} />
      <Stack.Screen name="register" options={{ headerShown: false }} component={MemoizedScreens.Register} />
      <Stack.Screen name="login" options={{ headerShown: false }} component={MemoizedScreens.Login} />
      <Stack.Screen name="AllCategory" options={{ headerShown: false }} component={MemoizedScreens.AllCategory} />
      <Stack.Screen name="Categorey-Page" options={{ headerShown: false }} component={MemoizedScreens.CategoryPage} />
      <Stack.Screen name="Product_info" options={{ headerShown: false }} component={MemoizedScreens.ProductInfo} />
      <Stack.Screen name="Contact_us" options={{ headerShown: true, title: "Contact us" }} component={MemoizedScreens.Contact} />
      <Stack.Screen name="Careers" options={{ headerShown: true, title: "Careers" }} component={MemoizedScreens.Careers} />
      <Stack.Screen name="Shop" options={{ headerShown: false }} component={MemoizedScreens.Shop} />
      <Stack.Screen name="Legal" options={{ headerShown: true, title: "Legal" }} component={MemoizedScreens.Legal} />
      <Stack.Screen name="Cart" options={{ headerShown: false, title: "Cart" }} component={MemoizedScreens.Cart} />
      <Stack.Screen name="Billing" options={{ headerShown: true, title: "Checkout" }} component={MemoizedScreens.Billing} />
      <Stack.Screen name="Search_Page" options={{ headerShown: true, title: "Search Medicines" }} component={MemoizedScreens.SearchPage} />
      <Stack.Screen name="failed_screen" options={{ headerShown: false, title: "Payment Failed" }} component={MemoizedScreens.FailedScreen} />
      <Stack.Screen name="success-screen" options={{ headerShown: false, title: "Payment Success" }} component={MemoizedScreens.SuccessScreen} />
      <Stack.Screen name="AllCoupons" options={{ headerShown: false, title: "Coupons" }} component={MemoizedScreens.AllCoupons} />
      <Stack.Screen name="Cancer_Library" options={{ headerShown: false, title: "Cancer Library" }} component={MemoizedScreens.CancerLibrary} />
      <Stack.Screen name="Testimonials" options={{ headerShown: false, title: "Testimonials" }} component={MemoizedScreens.Testimonials} />
      <Stack.Screen name="News" options={{ headerShown: false, title: "News" }} component={MemoizedScreens.News} />
      <Stack.Screen name="NewsDetail" options={{ headerShown: false, title: "News Detail" }} component={MemoizedScreens.NewsDetail} />
      <Stack.Screen name="About" options={{ headerShown: true, title: "About Onco HealthMart" }} component={MemoizedScreens.About} />
      <Stack.Screen name="Profile" options={{ headerShown: false, title: "Profile" }} component={MemoizedScreens.Profile} />
      <Stack.Screen name="Edit-Profile" options={{ headerShown: Platform.OS === "ios" ? true:false, title: "Edit Profile" }} component={MemoizedScreens.EditProfile} />
      <Stack.Screen name="Orders" options={{ headerShown: false, title: "Orders" }} component={MemoizedScreens.Orders} />
      <Stack.Screen name="AddressBook" options={{ headerShown: false, title: "Address Book" }} component={MemoizedScreens.AddressBook} />
      <Stack.Screen name="Prescriptions" options={{ headerShown: false, title: "Prescriptions" }} component={MemoizedScreens.Prescriptions} />
    </Stack.Navigator>
  );
});

// Navigation state listener to prevent unnecessary re-renders
const useNavigationStateListener = (navigationRef) => {
  const routeNameRef = useRef();
  
  return useCallback(() => {
    const previousRouteName = routeNameRef.current;
    const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;

    if (previousRouteName !== currentRouteName) {
      // Only update when route actually changes
      routeNameRef.current = currentRouteName;
      
      // Analytics tracking can go here
      if (__DEV__) {
        console.log(`Screen changed: ${currentRouteName}`);
      }
    }
  }, [navigationRef]);
};

// Optimized asset loading
const loadAssetsAsync = async () => {
  const fontPromise = Font.loadAsync({
    "ClashGrotesk-Variable": require("./assets/fonts/ClashGrotesk-Variable.ttf"),
  });

  const imagePromise = Asset.loadAsync([logo]);

  return Promise.all([fontPromise, imagePromise]);
};

// Main App component
const App = () => {
  const navigationRef = useNavigationContainerRef();
  const onStateChange = useNavigationStateListener(navigationRef);
  const [isLoading, setIsLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState("Splash");
  const [appIsReady, setAppIsReady] = useState(false);
  const hasInitializedRef = useRef(false);

  // Load assets and determine initial route only once
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const prepareApp = async () => {
      try {
        // Load assets in parallel
        await loadAssetsAsync();

        // Check for token
        const tokenData = await SecureStore.getItemAsync("token");
        const token = tokenData ? JSON.parse(tokenData) : null;

        if (token) {
          // Dispatch action to fetch user profile if token exists
          store.dispatch(fetchUserProfile());
          
          // Use setTimeout to prevent blocking UI
          setTimeout(() => {
            setInitialRoute("Splash");
            setIsLoading(false);
            setAppIsReady(true);
          }, 2000);
        } else {
          // Check if onboarding was skipped
          const isSkip = await SecureStore.getItemAsync("isSkip");
          
          setTimeout(() => {
            setInitialRoute(isSkip === "true" ? "Splash" : "Splash");
            setIsLoading(false);
            setAppIsReady(true);
          }, 2000);
        }
      } catch (error) {
        console.error("Error during app preparation:", error);
        Sentry.captureException(error);
        
        // Fallback to default route in case of error
        setInitialRoute("Splash");
        setIsLoading(false);
        setAppIsReady(true);
      }
    };

    prepareApp();
  }, []);

  // Handle splash screen hiding
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync().catch(() => {
        // Ignore errors
      });
    }
  }, [appIsReady]);

  // Hide splash screen when loading is complete
  useEffect(() => {
    if (!isLoading && appIsReady) {
      SplashScreen.hideAsync().catch(() => {
        // Ignore errors
      });
    }
  }, [isLoading, appIsReady]);

  // Show loader while app is initializing
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <Image source={logo} style={styles.loaderLogo} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer 
        ref={navigationRef} 
        onReady={onLayoutRootView}
        onStateChange={onStateChange}
      >
        <MemorizedNavigator initialRoute={initialRoute} />
      </NavigationContainer>
      <Toast navigation={navigationRef} />
    </GestureHandlerRootView>
  );
};

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
});

// Root App component with all providers
const RootApp = () => (
  <ErrorBoundary>
    <Provider store={store}>
      <ToastProvider>
        <LocationProvider>
       
          <App />
        </LocationProvider>
      </ToastProvider>
    </Provider>
  </ErrorBoundary>
);

// Register the app component
AppRegistry.registerComponent(appName, () => Sentry.wrap(RootApp));

export default RootApp;