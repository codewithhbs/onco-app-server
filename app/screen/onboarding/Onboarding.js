import React, { useEffect } from 'react';
import { Image, Text, View, TouchableOpacity } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import { useFonts } from 'expo-font';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';

const slides = [
  {
    id: 1,
    image: require('../../assets/Onboarding/1.png'),
    title: 'Welcome to Onco Health Mart – Your Trusted Online Pharmacy!',
    subtitle: 'Providing a secure and reliable platform for all your healthcare needs.',
  },
  {
    id: 2,
    image: require('../../assets/Onboarding/2.png'),
    title: 'Your One-Stop Solution for Wellness and Medicines.',
    subtitle: 'Leveraging over a decade of expertise with PAN India delivery.',
  },
  {
    id: 3,
    image: require('../../assets/Onboarding/3.png'),
    title: 'Affordable Cancer and Specialized Medicines at Your Fingertips.',
    subtitle: 'Ensuring premium quality at prices you can trust.',
  },
];

export default function OnboardingComponent() {
  const navigation = useNavigation()
  const [loaded, error] = useFonts({
    'CustomFont': require('../../assets/fonts/ClashGrotesk-Variable.ttf'),
  });

  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
    }
  }, [error]);

  if (!loaded) {
    return null;
  }

  const Square = ({ isLight, selected }) => {
    const backgroundColor = selected ? (isLight ? '#0A95DA' : 'white') : 'gray';
    return <View style={{ width: scale(6), height: scale(6), margin: scale(3), borderRadius: scale(3), backgroundColor }} />;
  };

  const Done = ({ isLight, ...props }) => (
    <TouchableOpacity onPress={() => navigation.navigate('register')} style={{ marginHorizontal: moderateScale(10) }} {...props}>
      <Text style={{ fontSize: moderateScale(16), color: isLight ? '#0A95DA' : 'white', fontFamily: 'CustomFont' }}>Register Now</Text>
    </TouchableOpacity>
  );

  const Skip = ({ isLight, ...props }) => (
    <TouchableOpacity onPress={() => navigation.navigate('register')} style={{ marginHorizontal: moderateScale(10) }} {...props}>
      <Text style={{ fontSize: moderateScale(16), color: isLight ? '#0A95DA' : 'white', fontFamily: 'CustomFont' }}>Skip</Text>
    </TouchableOpacity>
  );

  const Next = ({ isLight, ...props }) => (
    <TouchableOpacity style={{ marginHorizontal: moderateScale(10) }} {...props}>
      <Text style={{ fontSize: moderateScale(16), color: isLight ? '#0A95DA' : 'white', fontFamily: 'CustomFont' }}>Next</Text>
    </TouchableOpacity>
  );

  return (
    <Onboarding
      pages={slides.map(slide => ({
        backgroundColor: '#fff',
        image: <Image source={slide.image} style={{ width: scale(240), height: scale(240) }} />,
        title: (
          <Text
            style={{
              width: scale(310),
              fontSize: moderateScale(25),
              fontWeight: '100',
              marginBottom: verticalScale(12),
              fontFamily: 'CustomFont',
              color: '#0A95DA',
              textAlign: 'center',
            }}
          >
            {slide.title}
          </Text>
        ),
        subtitle: (
          <Text
            style={{
              width: scale(310),
              fontSize: moderateScale(14),
              fontWeight: '500',
              color: '#051821',
              textAlign: 'center',
            }}
          >
            {slide.subtitle}
          </Text>
        ),
      }))}
      containerStyles={{ marginHorizontal: scale(0) }}
      DotComponent={Square}
      bottomBarColor="#fff"
      DoneButtonComponent={Done}
      SkipButtonComponent={Skip}

      NextButtonComponent={Next}
      onSkip={() => navigation.navigate('login')}
      onDone={() => navigation.navigate('register')}
    />
  );
}
