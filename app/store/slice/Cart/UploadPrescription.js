import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store'; // Import Expo Secure Store
import axios from 'axios'; // Assuming you use axios to handle your API requests
import { API_V1_URL } from '../../../constant/API';

const initialState = {
    prescription: {},
    IsPrescription: false,
    loading: false,
    error: null,
};

// Store prescription image in SecureStore
const storePrescriptionInSecureStore = async (image) => {
    try {
        await SecureStore.setItemAsync('prescriptionImage', JSON.stringify(image));
    } catch (error) {
        console.log('Error storing prescription image in SecureStore:', error);
    }
};

// Upload prescription async action
export const UploadPrescription = createAsyncThunk(
    'prescription/upload', // Action name
    async (imageData, { rejectWithValue }) => {
        try {

            const response = await axios.post(`${API_V1_URL}/api/v1/Upload-Prescription`, imageData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });


            await storePrescriptionInSecureStore(imageData);

            return response.data;
        } catch (error) {
            return rejectWithValue(error.response ? error.response.data : error.message);
        }
    }
);

// Slice for managing prescription state
const prescriptionSlice = createSlice({
    name: 'prescription',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(UploadPrescription.pending, (state) => {
                state.loading = true;
            })
            .addCase(UploadPrescription.fulfilled, (state, action) => {
                state.loading = false;
                state.prescription = action.payload;
                state.IsPrescription = true;
            })
            .addCase(UploadPrescription.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default prescriptionSlice.reducer;
