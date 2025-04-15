import React from "react"
import { StyleSheet } from "react-native"
import PropTypes from "prop-types"
import { SafeAreaProvider } from "react-native-safe-area-context"
import Header from "../Header/Header"
import BottomBar from "../BottomBar/BottomBar"

export default function Layout({ children, isSearchShow = true, isLocation = true }) {
    return (
        <SafeAreaProvider style={styles.container}>
            <Header isLocation={isLocation} isSearchShow={isSearchShow} />
            {children}
            <BottomBar />
        </SafeAreaProvider>
    )
}

Layout.propTypes = {
    children: PropTypes.node.isRequired,
    isSearchShow: PropTypes.bool,
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})

