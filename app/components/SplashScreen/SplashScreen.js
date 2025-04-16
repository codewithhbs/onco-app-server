import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from "expo-secure-store";
import { fetchUserProfile } from '../../store/slice/auth/user.slice';
import { useDispatch, useSelector } from "react-redux";
import { getFromSecureStore } from '../../store/slice/auth/login.slice';

const videoSource = require('./splash.mp4');

export default function SplashScreen() {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [isProcessing, setIsProcessing] = useState(false);

    const player = useVideoPlayer(videoSource, player => {
        player.loop = true;
        player.play();
    });

    const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });

    useEffect(() => {
        if (isPlaying && !isProcessing) {
            setIsProcessing(true);

            const fetchData = async () => {
                try {
                    // Check for token
                    const tokenData = await SecureStore.getItemAsync("token");
                    const token = tokenData ? JSON.parse(tokenData) : null;

                    if (token) {
                        // Fetch user profile data
                        await dispatch(fetchUserProfile());

                        // Check if OTP verification is needed
                        const otpVerificationStatus = await SecureStore.getItemAsync("isVerify");
                        const isOtpVerified = JSON.parse(otpVerificationStatus) === "true";
                     
                        if (isOtpVerified) {
                        
                            setTimeout(() => {
                                navigation.navigate("Home");
                            }, 2800);
                        }else{
                        
                            setTimeout(() => {
                                navigation.navigate("login");
                            }, 2800);
                           
                        }
                    } else {
                        // No token - check if onboarding was skipped
                        const isSkip = await SecureStore.getItemAsync("isSkip");
                        console.log("isSkip",isSkip)

                        setTimeout(() => {
                            isSkip === "true" ? navigation.navigate('Home') : navigation.navigate('login');
                        }, 3000);
                    }
                } catch (error) {
                    console.error("Error in splash screen:", error);

                    // Fallback navigation in case of error
                    setTimeout(() => {
                        navigation.navigate('login');
                    }, 3000);
                }
            };

            fetchData();
        }
    }, [isPlaying, navigation, dispatch, isProcessing]);

    return (
        <View style={styles.contentContainer}>
            <VideoView
                nativeControls={false}
                style={styles.video}
                player={player}
                playbackRate={5}
                muted={true}
                contentFit='cover'
            />
        </View>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: '100%',
        height: '100%',
    },
});