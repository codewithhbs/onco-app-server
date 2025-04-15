import React, { useEffect, useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import * as SecureStore from "expo-secure-store"
import { useNavigation, useNavigationState } from "@react-navigation/native"

const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons)

const BottomBarButton = ({ icon, label, isActive, onPress }) => {
  const [scaleValue] = useState(new Animated.Value(1))

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start()

    onPress()
  }

  return (
    <TouchableOpacity style={styles.buttonContainer} onPress={handlePress}>
      <AnimatedIcon
        name={icon}
        size={24}
        color={isActive ? "#0A95DA" : "#9CA3AF"}
        style={[styles.icon, { transform: [{ scale: scaleValue }] }]}
      />
      <Text style={[styles.label, isActive && styles.activeLabel]}>{label}</Text>
    </TouchableOpacity>
  )
}

export default function BottomBar() {
  const [token, setToken] = useState(null)
  const navigation = useNavigation()
  const currentRouteName = useNavigationState((state) =>
    state.routes[state.index]?.name
  )

  useEffect(() => {
    const fetchData = async () => {
      const tokenData = await SecureStore.getItemAsync("token")
      setToken(tokenData ? JSON.parse(tokenData) : null)
    }
    fetchData()
  }, [])

  const buttons = [
    { icon: "home", label: "Home", path: "Home" },
    { icon: "shopping", label: "Shop", path: "Shop" },
    // { icon: "ribbon", label: "Cancer Library", path: "Cancer_Library" },
    { icon: "newspaper", label: "News", path: "News" },
  ]

  // Conditionally render the Profile or Login button based on token
  if (!token) {
    buttons.push({ icon: "login", label: "Login", path: "login" })
  } else {
    buttons.push({ icon: "account", label: "Profile", path: "Profile" })
  }

  return (
    <View style={styles.container}>
      {buttons.map((button) => (
        <BottomBarButton
          key={button.label}
          icon={button.icon}
          label={button.label}
          isActive={currentRouteName === button.path}
          onPress={() => navigation.navigate(button.path)}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    color: "#9CA3AF",
    textAlign: "center",
  },
  activeLabel: {
    color: "#0A95DA",
    fontWeight: "bold",
  },
})
