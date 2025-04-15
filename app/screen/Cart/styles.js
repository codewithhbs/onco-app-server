import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    containers: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#b6e4fc',
        borderRadius: 8,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    content: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#1F2937',
    },

    cartItemsContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    cartItem: {
        flexDirection: 'row',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 16,
    },
    productImage: {
        width: 40,
        height: 40,
        borderRadius: 8,
        marginRight: 12,
    },
    itemDetails: {
        flex: 1,
    },
    productTitle: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 4,
    },
    companyName: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    priceContainer: {
        marginBottom: 8,
        justifyContent: 'start',
        flexDirection: 'row',

        alignItems: 'center',

    },
    price: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#0A95DA',
        marginBottom: 8,
        marginHorizontal: 4
    },
    priceStrike: {
        textDecorationLine: 'line-through',
        color: '#999',
        fontSize: 10,
        marginBottom: 8,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        padding: 5,
        backgroundColor: '#f3f4f6',
        borderRadius: 6,
    },
    quantityText: {
        marginHorizontal: 16,
        fontSize: 12,
        fontWeight: '500',
    },

    couponSection: {
        marginBottom: 20,
    },
    couponInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    couponInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    couponInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        color: '#1F2937',
    },
    applyButton: {
        backgroundColor: '#54c1f7',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyButtonDisabled: {
        backgroundColor: '#A5B4FC',
    },
    applyButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: 8,
    },

    // Applied Coupon Styles
    appliedCouponContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F0FDF4',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#86EFAC',
    },
    appliedCouponInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    appliedCouponTexts: {
        marginLeft: 12,
    },
    appliedCouponCode: {
        fontSize: 16,
        fontWeight: '600',
        color: '#166534',
    },
    discountText: {
        fontSize: 14,
        color: '#059669',
        marginTop: 2,
    },
    removeCouponButton: {
        padding: 4,
    },

    // Price Breakdown Styles
    priceBreakdown: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 16,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    priceLabel: {
        fontSize: 14,
        color: '#4B5563',
    },
    priceValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
    },
    discountValue: {
        color: '#059669',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 12,
        marginTop: 12,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#06537a',
    },

    // Price Breakdown Styles // Checkout Button Styles
    disabledCheckout: {
        backgroundColor: '#D1D5DB', // Light gray for disabled state
        opacity: 0.7,
    },
    disabledCheckoutText: {
        color: '#011620',
    },

    checkoutButton: {
        backgroundColor: '#0a96db',
        borderRadius: 12,
        marginTop: 20,
        position: 'relative',
        overflow: 'hidden',
    },
    checkoutContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        position: 'relative',
    },
    checkoutLeft: {
        flex: 1,
    },
    checkoutTotal: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    viewDetailText: {
        color: '#E9D5FF',
        fontSize: 12,
        marginTop: 2,
    },
    checkoutRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 4,
    },


    // Prescription Upload Styles
    prescriptionContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
    },
    prescriptionNote: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    prescriptionList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    prescriptionItem: {
        width: 100,
        height: 100,
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
    },
    prescriptionImage: {
        width: '100%',
        height: '100%',
    },
    removePrescriptionButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        padding: 4,
    },
    uploadButton: {
        width: '100%',
        height: 100,
        borderWidth: 2,
        borderColor: '#FF3366',
        borderStyle: 'dashed',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    uploadText: {
        fontSize: 12,
        fontWeight: '500',
        color: '#0A95DA',
        textAlign: 'center',

    },
    uploadSubtext: {
        fontSize: 10,
        color: '#666',
        textAlign: 'center',
        marginTop: 2,
    },

    // Empty Cart Styles
    emptyCartContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    emptyCartTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyCartText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
    },
    shopNowButton: {
        backgroundColor: '#0A95DA',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 8,
    },
    shopNowText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    plusItems: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    icon: {
        marginRight: 8,
    },
    plushItemText: {
        color: '#0A95DA',
        fontSize: 14,
        fontWeight: 'bold',
    },
});