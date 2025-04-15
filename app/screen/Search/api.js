import axios from 'axios';
import { API_V1_URL } from '../../constant/API';

const BASE_URL = `${API_V1_URL}/api/v1`;

export const searchProducts = async (query) => {
  try {
    const response = await axios.get(`${BASE_URL}/getSearchByInput?q=${query}`);
    return response.data.updatedProducts || [];
  } catch (error) {
    console.error('Search API Error:', error);
    throw error;
  }
};