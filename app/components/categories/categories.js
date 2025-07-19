import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../store/slice/Categorey/categorey.slice';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import CategoriesSkeleton from './CategoriesSkeleton';
import { LinearGradient } from 'expo-linear-gradient'; // You might need to install this
import { useNavigation } from '@react-navigation/native';

export default function Categories() {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector((state) => state.categorey);
  const  navigation = useNavigation()
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  if (loading) {
    return <CategoriesSkeleton />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorCard}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>Failed to load categories</Text>
          <Text style={styles.errorSubtext}>Please try again later</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {categories?.slice(0, 5).map((cat) => (
          <TouchableOpacity key={cat.category_id} style={styles.categoryCard} onPress={() => navigation.navigate('Categorey-Page', { id: cat?.category_id, title: cat?.category_name })} activeOpacity={0.8}>
            <LinearGradient
              colors={['#E3F2FD', '#BBDEFB']}
              style={styles.gradientBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: cat.category_image }} 
                  style={styles.categoryImage}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay} />
              </View>
              <View style={styles.categoryContent}>
                <Text style={styles.categoryText} numberOfLines={2}>
                  {cat.category_name}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}

        {/* View All Button */}
        <TouchableOpacity style={styles.viewAllCard} onPress={()=> navigation.navigate('AllCategory')}  activeOpacity={0.8}>
          <LinearGradient
            colors={['#1976D2', '#2196F3']}
            style={styles.viewAllGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.viewAllIcon}>
              <Text style={styles.viewAllIconText}>+</Text>
            </View>
            <Text style={styles.viewAllText}>View All</Text>
            <Text style={styles.viewAllSubtext}>See more</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: verticalScale(10),
    paddingVertical: verticalScale(5),
  },
  scrollView: {
    paddingLeft: scale(12),
  },
  scrollContent: {
    paddingRight: scale(12),
  },
  categoryCard: {
    marginRight: scale(8),
    borderRadius: scale(12),
    elevation: 3,
    shadowColor: '#1976D2',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  gradientBackground: {
    width: scale(70),
    height: scale(80),
    justifyContent: 'space-between',
    padding: scale(8),
  },
  imageContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  categoryImage: {
    width: scale(35),
    height: scale(35),
    borderRadius: scale(8),
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ffffff40',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: scale(8),
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  categoryContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  categoryText: {
    textAlign: 'center',
    fontSize: moderateScale(9),
    color: '#1565C0',
    fontWeight: '600',
    lineHeight: moderateScale(11),
  },
  viewAllCard: {
    borderRadius: scale(12),
    elevation: 4,
    shadowColor: '#1976D2',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  viewAllGradient: {
    width: scale(70),
    height: scale(80),
    alignItems: 'center',
    justifyContent: 'center',
    padding: scale(8),
  },
  viewAllIcon: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(4),
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  viewAllIconText: {
    color: '#fff',
    fontSize: moderateScale(14),
    fontWeight: '300',
  },
  viewAllText: {
    color: '#fff',
    fontSize: moderateScale(9),
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: verticalScale(1),
  },
  viewAllSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: moderateScale(8),
    textAlign: 'center',
    fontWeight: '400',
  },
  errorContainer: {
    padding: scale(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(20),
  },
  errorCard: {
    backgroundColor: '#fff',
    padding: scale(20),
    borderRadius: scale(16),
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#FF5722',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722',
  },
  errorIcon: {
    fontSize: moderateScale(30),
    marginBottom: verticalScale(8),
  },
  errorText: {
    color: '#D32F2F',
    fontSize: moderateScale(16),
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: verticalScale(4),
  },
  errorSubtext: {
    color: '#757575',
    fontSize: moderateScale(12),
    textAlign: 'center',
  },
});