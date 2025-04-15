import React, { useState, useCallback, useEffect } from "react"
import {
  View,

  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Animated,
  ScrollView,
} from "react-native"
import { useNavigation } from "@react-navigation/native"
import Icon from "react-native-vector-icons/MaterialCommunityIcons"
import { ProductCard } from "../Products/ProductCard"

const { width } = Dimensions.get("window")
const ITEMS_PER_PAGE = 10


const sortOptions = [
  { label: "Default", value: "default", icon: "sort" },
  { label: "Price ↑", value: "price_low", icon: "arrow-up" },
  { label: "Price ↓", value: "price_high", icon: "arrow-down" },
  { label: "No Presc", value: "prescription", icon: "prescription" },
  { label: "Discount", value: "discount", icon: "percent" },
  { label: "In Stock", value: "in_stock", icon: "cart-check" },
];
const ProductsList = ({ data: initialData, isShow = true, isDShow = true }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("default")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [filteredData, setFilteredData] = useState(initialData)
  const navigation = useNavigation()
  const scrollY = new Animated.Value(0)

  const filterAndSortData = useCallback(() => {
    let result = [...initialData]

    if (searchQuery) {
      result = result.filter(
        (item) =>
          item.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.company_name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    switch (sortBy) {
      case "price_low":
        result.sort((a, b) => a.product_sp - b.product_sp)
        break
      case "price_high":
        result.sort((a, b) => b.product_sp - a.product_sp)
        break
      case "in_stock":
        result = result.filter((item) => item?.stock !== "Out of Stock")
        break
      case "prescription":
        result = result.filter((item) => item?.presciption_required === "No")
        break
      case "discount":
        result.sort((a, b) => {
          const discountA = ((a.product_mrp - a.product_sp) / a.product_mrp) * 100
          const discountB = ((b.product_mrp - b.product_sp) / b.product_mrp) * 100
          return discountB - discountA
        })
        break
      default:
        break
    }

    setFilteredData(result)
  }, [initialData, searchQuery, sortBy])

  useEffect(() => {
    filterAndSortData()
  }, [filterAndSortData])

  const handleLoadMore = () => {
    if (loading) return
    if (page * ITEMS_PER_PAGE >= filteredData.length) return

    setLoading(true)
    setPage((prev) => prev + 1)
    setTimeout(() => setLoading(false), 1500)
  }

  const renderSortButton = (label, value, iconName) => (
    <TouchableOpacity
      style={[styles.sortButton, sortBy === value && styles.sortButtonActive]}
      onPress={() => setSortBy(value)}
    >
      <Icon name={iconName} size={16} color={sortBy === value ? "#fff" : "#0A95DA"} style={styles.sortButtonIcon} />
      <Text style={[styles.sortButtonText, sortBy === value && styles.sortButtonTextActive]}>{label}</Text>
    </TouchableOpacity>
  )

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.header,

      ]}
    >

      <View style={styles.searchContainer}>
        <Icon name="magnify" size={24} color="#0A95DA" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#A0AEC0"
        />
      </View>


      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sortContainer}
      >
        {sortOptions.map((item) => (
          <View key={item.value} style={styles.sortItem}>
            {renderSortButton(item.label, item.value, item.icon)}
          </View>
        ))}
      </ScrollView>

    </Animated.View>
  )

  const renderFooter = () => {
    if (!loading) return null
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#0A95DA" />
      </View>
    )
  }

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="package-variant" size={64} color="#0A95DA" />
      <Text style={styles.emptyText}>No products found</Text>
    </View>
  )
  const displayedData = filteredData.slice(0, page * ITEMS_PER_PAGE);


  if (initialData.length === 0) {
    return renderEmpty()
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <ScrollView
        contentContainerStyle={styles.gridContainer}
        onScroll={({ nativeEvent }) => {
          if (nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - 50) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={16}
      >
        {displayedData.length === 0 ? (
          renderEmpty()
        ) : (
          <View style={styles.grid}>
            {displayedData.map((item) => (
              <View key={item.product_id.toString()} style={styles.productWrapper}>
                <ProductCard product={item} />
              </View>
            ))}
          </View>
        )}
        {renderFooter && renderFooter()}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },
  gridContainer: {
    marginHorizontal: 20,
    paddingBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productWrapper: {
    width: '45%', // Adjust width for a two-column layout
    marginBottom: 10,
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EDF2F7",
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#2D3748",
  },
  sortContainer: {
    paddingHorizontal: 16,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#0A95DA",
    backgroundColor: "#fff",
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: "#0A95DA",
  },
  sortButtonIcon: {
    marginRight: 4,
  },
  sortButtonText: {
    color: "#0A95DA",
    fontSize: 14,
    fontWeight: "600",
  },
  sortButtonTextActive: {
    color: "#fff",
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 16,
  },
  footer: {
    paddingVertical: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#0A95DA",
    marginTop: 16,
    fontWeight: "600",
  },
})

export default ProductsList

