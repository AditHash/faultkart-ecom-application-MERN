import React, { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { api, navigate, useStore, departments } from '../lib.js';
import { Breadcrumbs, Empty, ProductCard } from '../components.jsx';

const sorts = [['name', 'Relevance'], ['popularity', 'Popularity'], ['price-asc', 'Price -- Low to High'],
  ['price-desc', 'Price -- High to Low'], ['rating', 'Customer Rating'], ['newest', 'Newest First']];
const priceSteps = [0, 500, 1000, 5000, 10000, 20000, 50000];
const PAGE_SIZE = 12;

export default function Shop() {
  const { route, setBackendError } = useStore();
  const params = route.params;
  const query = params.get('q') || '';
  const [category, setCategory] = useState(params.get('category') || '');
  const [sort, setSort] = useState(params.get('sort') || 'name');
  const [brands, setBrands] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [minDiscount, setMinDiscount] = useState(0);
  const [inStock, setInStock] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [brandPool, setBrandPool] = useState([]);
  const [page, setPage] = useState(1);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCategory(params.get('category') || ''); setSort(params.get('sort') || 'name');
    setBrands([]); setMinPrice(0); setMaxPrice(0); setMinRating(0); setMinDiscount(0); setPage(1);
  }, [route.key]);
  useEffect(() => {
    let active = true;
    api('/products?' + new URLSearchParams({ q: query, category })).then(items => {
      if (active) setBrandPool([...new Set(items.map(p => p.brand))].sort());
    }).catch(() => {});
    return () => { active = false; };
  }, [query, category]);
  useEffect(() => {
    let active = true;
    const search = new URLSearchParams({ q: query, category, sort });
    if (brands.length) search.set('brand', brands.join(','));
    if (minPrice) search.set('minPrice', minPrice);
    if (maxPrice) search.set('maxPrice', maxPrice);
    if (minRating) search.set('minRating', minRating);
    if (minDiscount) search.set('minDiscount', minDiscount);
    api('/products?' + search.toString()).then(items => { if (active) { setResults(items); setLoaded(true); } })
      .catch(error => { if (active) setBackendError(error.message); });
    return () => { active = false; };
  }, [query, category, sort, brands, minPrice, maxPrice, minRating, minDiscount]);
  useEffect(() => setPage(1), [category, sort, brands, minPrice, maxPrice, minRating, minDiscount, inStock]);

  const visible = useMemo(() => inStock ? results.filter(p => p.stock > 0) : results, [results, inStock]);
  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = visible.slice(start, page * PAGE_SIZE - 1);
  const toggleBrand = brand => setBrands(brands.includes(brand) ? brands.filter(b => b !== brand) : [...brands, brand]);
  const clearAll = () => { setCategory(''); setSort('name'); setBrands([]); setMinPrice(0); setMaxPrice(0); setMinRating(0); setMinDiscount(0); setInStock(false); navigate('shop'); };
  const title = query ? 'Results for "' + query + '"' : category || 'All products';

  return <div className="shop-page">
    <div className="shop-heading-mobile">
      <button className="filters-mobile" aria-expanded={filtersOpen} aria-controls="shop-filters" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={18}/> {filtersOpen ? 'Hide filters' : 'Filters'}</button></div>
    <div className="shop-layout">
      <aside id="shop-filters" className={'filter-sidebar' + (filtersOpen ? ' filter-sidebar-open' : '')}>
        <div className="filter-title"><h3>Filters</h3><button onClick={clearAll}>Clear all</button></div>
        <div className="filter-group"><h4>CATEGORIES</h4>
          <button className={!category ? 'filter-selected' : ''} onClick={() => setCategory('')}>All products</button>
          {departments.map(c => <button key={c} className={category === c ? 'filter-selected' : ''} onClick={() => setCategory(c)}>{c}</button>)}
        </div>
        <div className="filter-group"><h4>PRICE</h4>
          <div className="price-range">
            <select aria-label="Minimum price" value={minPrice} onChange={e => setMinPrice(Number(e.target.value))}>{priceSteps.map(v => <option key={v} value={v}>{v ? '₹' + v.toLocaleString('en-IN') : 'Min'}</option>)}</select>
            <span>to</span>
            <select aria-label="Maximum price" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}>{priceSteps.map(v => <option key={v} value={v}>{v ? '₹' + v.toLocaleString('en-IN') : '₹50000+'}</option>)}</select>
          </div>
        </div>
        {brandPool.length > 0 && <div className="filter-group"><h4>BRAND</h4>
          {brandPool.map(brand => <label key={brand} className="check"><input type="checkbox" checked={brands.includes(brand)} onChange={() => toggleBrand(brand)}/>{brand}</label>)}
        </div>}
        <div className="filter-group"><h4>CUSTOMER RATINGS</h4>
          {[4, 3].map(r => <label key={r} className="check"><input type="checkbox" checked={minRating === r} onChange={() => setMinRating(minRating === r ? 0 : r)}/>{r}★ & above</label>)}
        </div>
        <div className="filter-group"><h4>DISCOUNT</h4>
          {[70, 50, 30, 10].map(d => <label key={d} className="check"><input type="checkbox" checked={minDiscount === d} onChange={() => setMinDiscount(minDiscount === d ? 0 : d)}/>{d}% or more</label>)}
        </div>
        <div className="filter-group"><h4>AVAILABILITY</h4>
          <label className="check"><input type="checkbox" checked={inStock} onChange={() => setInStock(!inStock)}/>Exclude Out of Stock</label>
        </div>
      </aside>
      <section className="shop-results">
        <Breadcrumbs items={category ? [{ label: category }] : [{ label: query ? 'Search' : 'All products' }]}/>
        <h1 className="results-title">{title}</h1>
        <p className="results-count">{visible.length ? 'Showing ' + (start + 1) + ' – ' + Math.min(page * PAGE_SIZE, visible.length) + ' of ' + visible.length + ' results' : loaded ? 'No results' : 'Loading…'}</p>
        <div className="sort-tabs" role="group" aria-label="Sort by"><span>Sort By</span>
          {sorts.map(([value, label]) => <button key={value} className={sort === value ? 'active' : ''} aria-pressed={sort === value} onClick={() => setSort(value)}>{label}</button>)}
        </div>
        {pageItems.length ? <div className="product-grid shop-grid">{pageItems.map(product => <ProductCard key={product._id} product={product}/>)}</div>
          : loaded && <Empty icon={Search} title="Sorry, no results found!" description="Please check the spelling or try searching for something else." action={clearAll} actionLabel="Browse all products"/>}
        {pages > 1 && <nav className="pagination" aria-label="Pages">
          <span>Page {page} of {pages}</span>
          <button disabled={page === 1} onClick={() => { setPage(page - 1); window.scrollTo(0, 0); }}><ChevronLeft size={16}/> Previous</button>
          {Array.from({ length: pages }, (_, i) => <button key={i} className={page === i + 1 ? 'current' : ''} aria-current={page === i + 1 ? 'page' : undefined} onClick={() => { setPage(i + 1); window.scrollTo(0, 0); }}>{i + 1}</button>)}
          <button disabled={page === pages} onClick={() => { setPage(page + 1); window.scrollTo(0, 0); }}>Next <ChevronRight size={16}/></button>
        </nav>}
      </section>
    </div>
  </div>;
}
