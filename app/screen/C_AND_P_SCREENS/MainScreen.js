import { View, Text, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import BreadCrumbs from './BreadCrumbs';
import BannerImage from './BannerImage';
import ProductsList from './Products.list';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header/Header';
import { fetchCategoriesById } from '../../store/slice/Categorey/categorey.slice';
import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Loader from '../../components/Loader'; // import Loader
import Layout from '../../components/Layout/Layout';
import { API_V1_URL } from '../../constant/API';

export default function MainScreen() {
    const dispatch = useDispatch();
    const { categoriesById } = useSelector((state) => state.categorey);
    const [error, setError] = useState('');
    const route = useRoute();
    const { id, title } = route.params || {};
    const [cProduct, setCproduct] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCproduct = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`${API_V1_URL}/api/v1/get-products?category=${id}`);
            setCproduct(data.data);
            //   console.log(data.data.length)
            setLoading(false);
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            dispatch(fetchCategoriesById(id));
            fetchCproduct();
        }
    }, [dispatch, id, fetchCproduct]);

    if (loading) {
        return <Loader message="Please Be Wait, Your Medicine Are Coming..." />;
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        );
    }

    return (
        <Layout isLocation={false} isSearchShow={false}>

            {/* <BreadCrumbs where={'Category'} title={title} /> */}
            <BannerImage image={categoriesById?.category_banner} />
            <ProductsList data={cProduct} />
        </Layout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    errorText: {
        color: 'red',
        fontSize: 18,
    },
});
