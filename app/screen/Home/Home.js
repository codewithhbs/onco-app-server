import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import axios from 'axios';
import Header from '../../components/Header/Header';
import Categories from '../../components/categories/categories';
import DynmaicSlider from '../../components/Slider/DynamicSlider';
import { ProductList } from '../Products/ProductList';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slice/auth/login.slice';
import PrescriptionUpload from '../../components/Upload/PrescriptionUpload';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DealsSction from '../../components/Deals/Deals';
import Top_Selling from '../Products/Top_Selling';
import Layout from '../../components/Layout/Layout';
import Loader from '../../components/Loader';
import { API_V1_URL } from '../../constant/API';
import AllCategories from '../../components/categories/AllCategories';

export default function Home() {

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_V1_URL}/api/v1/get-all-active-banner`);
      if (response.data && response.data.data) {
        setBanners(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching banners:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    
    if (banners.length === 0) {
      fetchBanners();
    }
  }, []); 

 
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBanners();
    setRefreshing(false);
  };


  const images = banners.map((item) => item.banner_image)
  const imagesSent = [{ id: 1, src: images }];

  if (loading) {
    return (
      <Loader />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Layout>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <AllCategories />
          <DynmaicSlider
            navigationShow={true}
            heightPass={200}
            mode="cover"
            autoPlay={true}
            Dealy={4000}
            isUri={true}
            imagesByProp={imagesSent}
          />
          <PrescriptionUpload />
          <Top_Selling />
          <DealsSction />
          <ProductList />
          <ProductList whatDisplay='latest_product' />
       
        </ScrollView>
      </Layout>
    </SafeAreaView>
  );
}
