import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from "expo-secure-store"
import { fetchUserProfile } from '../../store/slice/auth/user.slice';
import { useDispatch } from "react-redux"

const videoSource = require('./splash.mp4')

export default function SplashScreen() {
    const navigation = useNavigation();
    const dispatch = useDispatch()

    const player = useVideoPlayer(videoSource, player => {
        player.loop = true;
        player.play();
    });
    const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

    useEffect(() => {
        if (isPlaying) {
            const fetchData = async () => {
                const tokenData = await SecureStore.getItemAsync("token")
                const token = tokenData ? JSON.parse(tokenData) : null
                if (token) {

                    await dispatch(fetchUserProfile())
                    setTimeout(() => {
                        navigation.navigate("Home")
                    }, 2800)
                } else {

                    const isSkip = await SecureStore.getItemAsync("isSkip")

                    setTimeout(() => {
                        isSkip === "true" ? navigation.navigate('Home') : navigation.navigate('login')
                    }, 3000)

                }
            }
            fetchData()
        }
    }, [isPlaying, navigation]);


    return (
        <View style={styles.contentContainer}>
            <VideoView nativeControls={false} style={styles.video} player={player} playbackRate={5} muted={true} contentFit='cover' />

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',

    },
    video: {
        width: '100%',
        height: '100%',
    },
});
