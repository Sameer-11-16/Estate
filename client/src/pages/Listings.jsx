import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiSliders, FiSearch } from 'react-icons/fi';
import LandCard from '../components/LandCard';
import API from '../utils/api';
import './Listings.css';

const DEFAULT_DISTRICTS = [
  'All Districts','Gorakhpur','Lucknow','Ayodhya','Varanasi','Prayagraj',
  'Kanpur','Noida','Ghaziabad','Meerut','Agra','Bareilly',
  'Basti','Deoria','Maharajganj','Kushinagar','Siddharthnagar'
];

const DEFAULT_LAND_TYPES = ['All Types','Residential','Commercial','Agricultural','Industrial','Mixed Use'];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'priceAsc', label: 'Price: Low to High' },
  { value: 'priceDesc', label: 'Price: High to Low' },
  { value: 'areaAsc', label: 'Area: Small to Large' },
  { value: 'areaDesc', label: 'Area: Large to Small' },
];

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [districtsList, setDistrictsList] = useState(DEFAULT_DISTRICTS);
  const [landTypesList, setLandTypesList] = useState(DEFAULT_LAND_TYPES);

  // Filters from URL
  const [filters, setFilters] = useState({
    district: searchParams.get('district') || '',
    landType: searchParams.get('landType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minArea: searchParams.get('minArea') || '',
    maxArea: searchParams.get('maxArea') || '',
    roadFacing: searchParams.get('roadFacing') === 'true',
    sort: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page') || 1),
    search: searchParams.get('search') || '',
  });

  // Fetch dynamic filters options from backend
  useEffect(() => {
    API.get('/listings/filters')
      .then((res) => {
        if (res.data?.districts?.length > 0) {
          const merged = ['All Districts', ...new Set([...DEFAULT_DISTRICTS.slice(1), ...res.data.districts])];
          setDistrictsList(merged);
        }
        if (res.data?.landTypes?.length > 0) {
          const mergedTypes = ['All Types', ...new Set([...DEFAULT_LAND_TYPES.slice(1), ...res.data.landTypes])];
          setLandTypesList(mergedTypes);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.district && filters.district !== 'All Districts') params.district = filters.district;
      if (filters.landType && filters.landType !== 'All Types') params.landType = filters.landType;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.minArea) params.minArea = filters.minArea;
      if (filters.maxArea) params.maxArea = filters.maxArea;
      if (filters.roadFacing) params.roadFacing = 'true';
      if (filters.search) params.search = filters.search;
      params.sort = filters.sort;
      params.page = filters.page;
      params.limit = 12;

      const res = await API.get('/listings', { params });
      setListings(res.data.listings || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const updateFilter = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      district: '', landType: '', minPrice: '', maxPrice: '',
      minArea: '', maxArea: '', roadFacing: false,
      sort: 'newest', page: 1, search: '',
    });
  };

  const activeFilterCount = [
    filters.district && filters.district !== 'All Districts',
    filters.landType && filters.landType !== 'All Types',
    filters.minPrice,
    filters.maxPrice,
    filters.minArea,
    filters.maxArea,
    filters.roadFacing,
  ].filter(Boolean).length;

  return (
    <div className="listings-page page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="listings-header">
          <div>
            <h1 className="listings-title">Browse Land & Plots</h1>
            <p className="listings-subtitle">
              {loading ? 'Loading plots...' : `${total.toLocaleString()} ${total === 1 ? 'plot' : 'plots'} available`}
              {filters.search && ` for "${filters.search}"`}
              {filters.district && filters.district !== 'All Districts' && ` in ${filters.district}`}
            </p>
          </div>
          <div className="listings-controls">
            <div className="search-bar">
              <FiSearch />
              <input
                type="text"
                placeholder="Search Gorakhpur, Lucknow, Taramandal..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                id="listings-search"
              />
            </div>
            <select
              className="sort-select"
              value={filters.sort}
              onChange={(e) => updateFilter('sort', e.target.value)}
              id="listings-sort"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button className="filter-toggle" onClick={() => setSidebarOpen(true)}>
              <FiSliders />
              Filters
              {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
            </button>
          </div>
        </div>

        <div className="listings-layout">
          {/* Sidebar */}
          <aside className={`filter-sidebar ${sidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <h3><FiFilter /> Filters</h3>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {activeFilterCount > 0 && (
                  <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear All</button>
                )}
                <button className="btn btn-ghost btn-icon" onClick={() => setSidebarOpen(false)}>
                  <FiX />
                </button>
              </div>
            </div>

            {/* District */}
            <div className="filter-group">
              <label className="filter-label">City / District (UP)</label>
              <select
                className="form-select"
                value={filters.district || 'All Districts'}
                onChange={(e) => updateFilter('district', e.target.value === 'All Districts' ? '' : e.target.value)}
                id="filter-district"
              >
                {districtsList.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>

            {/* Land Type */}
            <div className="filter-group">
              <label className="filter-label">Land Category</label>
              <div className="type-pills">
                {landTypesList.map((t) => (
                  <button
                    key={t}
                    className={`type-pill ${(filters.landType === t || (t === 'All Types' && !filters.landType)) ? 'active' : ''}`}
                    onClick={() => updateFilter('landType', t === 'All Types' ? '' : t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="filter-group">
              <label className="filter-label">Price Budget (₹)</label>
              <div className="range-inputs">
                <input
                  type="number"
                  className="form-input"
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  id="filter-min-price"
                />
                <span>—</span>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  id="filter-max-price"
                />
              </div>
            </div>

            {/* Area Range */}
            <div className="filter-group">
              <label className="filter-label">Plot Area (Sq.Ft / Bigha)</label>
              <div className="range-inputs">
                <input
                  type="number"
                  className="form-input"
                  placeholder="Min Area"
                  value={filters.minArea}
                  onChange={(e) => updateFilter('minArea', e.target.value)}
                  id="filter-min-area"
                />
                <span>—</span>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Max Area"
                  value={filters.maxArea}
                  onChange={(e) => updateFilter('maxArea', e.target.value)}
                  id="filter-max-area"
                />
              </div>
            </div>

            {/* Road Facing */}
            <div className="filter-group">
              <label className="filter-label">Property Features</label>
              <label className="toggle-label">
                <div className={`toggle ${filters.roadFacing ? 'on' : ''}`}
                  onClick={() => updateFilter('roadFacing', !filters.roadFacing)}
                  id="filter-road-facing"
                >
                  <div className="toggle-thumb" />
                </div>
                Main Road Facing
              </label>
            </div>

            <button className="btn btn-primary w-full mt-2" onClick={() => setSidebarOpen(false)}>
              Apply Filters
            </button>
          </aside>

          {/* Backdrop */}
          {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

          {/* Grid */}
          <main className="listings-grid-area">
            {loading ? (
              <div className="loading-center"><div className="spinner" /></div>
            ) : listings.length === 0 ? (
              <div className="no-results glass">
                <span className="no-results-icon">🔍</span>
                <h3>No plots found</h3>
                <p>Try adjusting your search query or selecting another district</p>
                <button className="btn btn-primary mt-2" onClick={clearFilters}>Reset All Filters</button>
              </div>
            ) : (
              <div className="listings-grid">
                {listings.map((l) => <LandCard key={l._id} listing={l} />)}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`page-btn ${p === filters.page ? 'active' : ''}`}
                    onClick={() => setFilters((prev) => ({ ...prev, page: p }))}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
