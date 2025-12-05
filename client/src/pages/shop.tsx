import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useLocation, Link } from 'wouter';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Search, SlidersHorizontal, X, Percent } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useCurrency } from '@/contexts/CurrencyContext';

interface Product {
  _id: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  description: string;
  category: string;
  imageUrl: string;
  inStock: boolean;
  featured: boolean;
}

export default function Shop() {
  const [location] = useLocation();
  const { formatPrice } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [showBestSellersOnly, setShowBestSellersOnly] = useState(false);
  const [showNewInOnly, setShowNewInOnly] = useState(false);
  const [showOnSaleOnly, setShowOnSaleOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'name'>('newest');

  // Check for filters from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const filter = params.get('filter');
    const categoryParam = params.get('category');
    
    if (filter === 'bestsellers') {
      setShowBestSellersOnly(true);
      setShowNewInOnly(false);
    } else if (filter === 'newin') {
      setShowNewInOnly(true);
      setShowBestSellersOnly(false);
    }
    
    if (categoryParam) {
      setSelectedCategories([decodeURIComponent(categoryParam)]);
    }
  }, [location]);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['allProducts'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    },
  });

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return Array.from(cats);
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = products.filter(product => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!product.name.toLowerCase().includes(query) && 
            !product.description.toLowerCase().includes(query) &&
            !product.category.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
        return false;
      }

      // Price filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      // In stock filter
      if (showInStockOnly && !product.inStock) {
        return false;
      }

      // Best sellers filter
      if (showBestSellersOnly && !product.featured) {
        return false;
      }

      // New in filter (show newest products - we'll consider all as "new" for now)
      // In a real app, this would filter by createdAt date
      if (showNewInOnly) {
        // Keep only newest items (first 10 products when sorted by newest)
        return true;
      }

      // On Sale filter - only show products with compareAtPrice greater than current price
      if (showOnSaleOnly && (!product.compareAtPrice || product.compareAtPrice <= product.price)) {
        return false;
      }

      return true;
    });

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // newest - keep original order (assuming sorted by createdAt desc from API)
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategories, priceRange, showInStockOnly, showBestSellersOnly, showNewInOnly, showOnSaleOnly, sortBy]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setPriceRange([0, 5000]);
    setShowInStockOnly(false);
    setShowBestSellersOnly(false);
    setShowNewInOnly(false);
    setShowOnSaleOnly(false);
    setSortBy('newest');
    // Clear URL params
    window.history.replaceState({}, '', '/shop');
  };

  const hasActiveFilters = searchQuery || selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 5000 || showInStockOnly || showBestSellersOnly || showNewInOnly || showOnSaleOnly;

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Categories */}
      <div>
        <h3 className="font-serif text-lg mb-4">Categories</h3>
        <div className="space-y-3">
          {categories.map(category => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox
                id={category}
                checked={selectedCategories.includes(category)}
                onCheckedChange={() => toggleCategory(category)}
                data-testid={`filter-category-${category}`}
              />
              <Label htmlFor={category} className="text-sm cursor-pointer">
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-serif text-lg mb-4">Price Range</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={5000}
            step={50}
            className="mb-4"
            data-testid="filter-price-range"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>

      {/* New In */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="newIn"
          checked={showNewInOnly}
          onCheckedChange={(checked) => {
            setShowNewInOnly(checked === true);
            if (checked) setShowBestSellersOnly(false);
          }}
          data-testid="filter-new-in"
        />
        <Label htmlFor="newIn" className="text-sm cursor-pointer">
          New Arrivals
        </Label>
      </div>

      {/* Best Sellers */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="bestSellers"
          checked={showBestSellersOnly}
          onCheckedChange={(checked) => {
            setShowBestSellersOnly(checked === true);
            if (checked) setShowNewInOnly(false);
          }}
          data-testid="filter-best-sellers"
        />
        <Label htmlFor="bestSellers" className="text-sm cursor-pointer">
          Best Sellers Only
        </Label>
      </div>

      {/* On Sale */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="onSale"
          checked={showOnSaleOnly}
          onCheckedChange={(checked) => setShowOnSaleOnly(checked === true)}
          data-testid="filter-on-sale"
        />
        <Label htmlFor="onSale" className="text-sm cursor-pointer flex items-center gap-1">
          <Percent className="w-3 h-3" />
          On Sale
        </Label>
      </div>

      {/* In Stock */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="inStock"
          checked={showInStockOnly}
          onCheckedChange={(checked) => setShowInStockOnly(checked === true)}
          data-testid="filter-in-stock"
        />
        <Label htmlFor="inStock" className="text-sm cursor-pointer">
          In Stock Only
        </Label>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={clearFilters}
          data-testid="button-clear-filters"
        >
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="pt-24 sm:pt-32 pb-8 sm:pb-12 px-4 sm:px-6 bg-secondary/30">
        <div className="container mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-center mb-3 sm:mb-4">
            {showNewInOnly ? 'New Arrivals' : showBestSellersOnly ? 'Best Sellers' : 'Shop All'}
          </h1>
          <p className="text-center text-muted-foreground max-w-xl mx-auto text-sm sm:text-base px-4">
            {showNewInOnly 
              ? 'Discover our latest arrivals, fresh from the runway to your wardrobe.'
              : showBestSellersOnly 
                ? 'Explore our most loved pieces, chosen by our community.'
                : 'Discover our curated collection of luxury fashion pieces, designed for the modern woman.'
            }
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-32">
              <h2 className="font-serif text-xl mb-6">Filters</h2>
              <FilterContent />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Search and Sort Bar */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 sm:h-10 text-base"
                  data-testid="input-search"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  >
                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="flex-1 sm:flex-none px-4 py-2 h-11 sm:h-10 border rounded-md bg-background text-base sm:text-sm"
                  data-testid="select-sort"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                </select>

                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden h-11 sm:h-10 min-w-[44px]" data-testid="button-mobile-filters">
                      <SlidersHorizontal className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Filters</span>
                      {hasActiveFilters && (
                        <span className="ml-1 sm:ml-2 w-2 h-2 bg-primary rounded-full" />
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[85vw] max-w-[320px]">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Results Count */}
            <p className="text-sm text-muted-foreground mb-6">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              {hasActiveFilters && ' (filtered)'}
            </p>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] bg-muted rounded-lg mb-3 sm:mb-4" />
                    <div className="h-3 sm:h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 sm:h-4 bg-muted rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <p className="text-base sm:text-lg text-muted-foreground mb-4">No products found</p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="h-11">
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
                {filteredProducts.map((product, index) => (
                  <Link href={`/product/${product._id}`} key={product._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      className="group cursor-pointer"
                      data-testid={`card-product-${product._id}`}
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-2 sm:mb-4 rounded-lg">
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Sale Badge */}
                        {product.compareAtPrice && product.compareAtPrice > product.price && (
                          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white px-2 py-1 rounded-sm text-xs font-bold flex items-center gap-1">
                            <Percent className="w-3 h-3" />
                            <span>SALE</span>
                          </div>
                        )}
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white text-sm uppercase tracking-wider">Out of Stock</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-white text-black py-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 text-xs uppercase tracking-widest font-medium text-center"
                        >
                          View Details
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 hidden sm:block">
                            {product.category}
                          </p>
                          <h3 className="font-serif text-sm sm:text-lg group-hover:underline decoration-1 underline-offset-4 line-clamp-2">
                            {product.name}
                          </h3>
                        </div>
                        <div className="flex flex-col items-end sm:flex-shrink-0">
                          {product.compareAtPrice && product.compareAtPrice > product.price ? (
                            <>
                              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</span>
                              <span className="text-sm sm:text-lg font-serif text-red-600">{formatPrice(product.price)}</span>
                            </>
                          ) : (
                            <span className="text-sm sm:text-lg font-serif">{formatPrice(product.price)}</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
