import React from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import PropTypes from "prop-types";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Header from "../Header/Header";
import BottomBar from "../BottomBar/BottomBar";

export default function Layout({ 
  children, 
  isSearchShow = true, 
  isLocation = true, 
  isSafe = true 
}) {
  return (
    <SafeAreaProvider style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Header isSearchShow={isSearchShow} isLocation={isLocation} />
      
      {isSafe ? (
        <SafeAreaView style={styles.container}>
          {children}
        </SafeAreaView>
      ) : (
        <View style={styles.container}>
          {children}
        </View>
      )}
      
      <BottomBar />
    </SafeAreaProvider>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  isSearchShow: PropTypes.bool,
  isLocation: PropTypes.bool,
  isSafe: PropTypes.bool,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});