import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Search, ShoppingCart, Heart, UserRound, MapPin, Menu, X, Package,
  ChevronRight, ArrowRight, Star, Truck, ShieldCheck, RotateCcw,
  Plus, Minus, Trash2, SlidersHorizontal, Tag, ShoppingBag, CreditCard,
  Wallet, CheckCircle2, Sparkles, Zap, Smartphone, Shirt, House,
  Dumbbell, Headphones, Grid2X2, ArrowLeft, Gift, ChevronDown,
  AlertCircle, Info, Headset, BadgeCheck
} from 'lucide-react';
import './style.css';

const sessionKey = 'faultkart-session';
const storedSession = localStorage.getItem(sessionKey) || Math.random().toString(36).slice(2, 14);
localStorage.setItem(sessionKey, storedSession);
const formatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const money = value => formatter.format(Number(value || 0));
const savings = item => item.mrp > item.price ? Math.round((item.mrp - item.price) / item.mrp * 100) : 0;

const categories = [
  { label: 'Electronics', icon: Smartphone, color: 'blue' },
  { label: 'Fashion', icon: Shirt, color: 'rose' },
  { label: 'Accessories', icon: ShoppingBag, color: 'lavender' },
  { label: 'Home', icon: House, color: 'peach' },
  { label: 'Appliances', icon: Zap, color: 'mint' },
  { label: 'Beauty', icon: Sparkles, color: 'pink' },
  { label: 'Sports', icon: Dumbbell, color: 'sky' }
];
const initialCart = { items: [], subtotal: 0, discount: 0, total: 0 };

async function api(path, options = {}) {
  const response = await fetch('/api' + path, {
    ...options,
    headers: { 'Content-Type': 'application/json', 'x-demo-session': 'demo-' + storedSession, ...(options.headers || {}) }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Could not complete request');
  return data;
}
function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  const [path = '', query = ''] = hash.split('?');
  const parts = path.split('/').filter(Boolean);
  return { page: parts[0] || 'home', id: parts[1] || '', query, key: hash };
}
function navigate(path) {
  window.location.hash = '#/' + path.replace(/^\/+/, '');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function ProductImage({ product, className = '' }) {
  return <div className={'product-photo ' + className} aria-label={product.name}>
    <img src={product.image || ''} alt={product.name} loading="lazy" onError={event => {
      event.currentTarget.style.display = 'none';
      event.currentTarget.parentElement.classList.add('image-fallback');
    }} />
    <span className="photo-fallback-label">{product.name}</span>
  </div>;
}
function Rating({ product }) {
  return <span className="rating"><Star size={12} fill="currentColor" strokeWidth={1.5}/>{Number(product.rating || 4.4).toFixed(1)}</span>;
}
function SectionHeading({ eyebrow, title, subtitle, onMore }) {
  return <div className="section-heading">
    <div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
    {onMore && <button className="text-link" onClick={onMore}>View all <ArrowRight size={16}/></button>}
  </div>;
}
function Empty({ icon: Icon = ShoppingBag, title, description, action, actionLabel = 'Continue shopping' }) {
  return <div className="empty-state"><div className="empty-icon"><Icon size={34}/></div><h2>{title}</h2><p>{description}</p>
    {action && <button className="btn btn-primary" onClick={action}>{actionLabel} <ArrowRight size={16}/></button>}</div>;
}
function App() {
  const [route, setRoute] = useState(getRoute());
  const [products, setProducts] = useState([]);
  const [results, setResults] = useState([]);
  const [cart, setCart] = useState(initialCart);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [searchDraft, setSearchDraft] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('name');
  const [couponDraft, setCouponDraft] = useState('');
  const [coupon, setCoupon] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [address, setAddress] = useState({ fullName: '', phone: '', address: '', city: '', state: '', pincode: '' });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const updateRoute = () => { setRoute(getRoute()); setMenuOpen(false); };
    window.addEventListener('hashchange', updateRoute);
    return () => window.removeEventListener('hashchange', updateRoute);
  }, []);
  useEffect(() => {
    if (route.page === 'shop') {
      const params = new URLSearchParams(route.query);
      setQuery(params.get('q') || '');
      setSearchDraft(params.get('q') || '');
      setCategory(params.get('category') || '');
      setSort(params.get('sort') || 'name');
    }
  }, [route.key]);

  async function reloadCart(nextCoupon = coupon) {
    setCart(await api('/cart?coupon=' + encodeURIComponent(nextCoupon)));
  }
  async function reloadAll() {
    const [all, nextCart, nextWishlist, nextOrders] = await Promise.all([
      api('/products'), api('/cart?coupon=' + encodeURIComponent(coupon)), api('/wishlist'), api('/orders')
    ]);
    setProducts(all);
    setCart(nextCart);
    setWishlist(nextWishlist);
    setOrders(nextOrders);
    setBackendError('');
  }
  useEffect(() => {
    let active = true;
    Promise.all([api('/products'), api('/cart'), api('/wishlist'), api('/orders')])
      .then(([all, basket, favourites, history]) => {
        if (!active) return;
        setProducts(all); setResults(all); setCart(basket); setWishlist(favourites); setOrders(history);
        setBackendError('');
      })
      .catch(error => { if (active) setBackendError(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (route.page !== 'shop') return;
    let active = true;
    const params = new URLSearchParams({ q: query, category, sort });
    api('/products?' + params.toString()).then(items => { if (active) setResults(items); })
      .catch(error => { if (active) setBackendError(error.message); });
    return () => { active = false; };
  }, [route.page, query, category, sort]);

  async function act(operation, success = 'Updated successfully') {
    setBusy(true);
    try {
      await operation();
      await reloadAll();
      setNotice(success);
      setFormError('');
      return true;
    } catch (error) {
      setNotice(error.message);
      return false;
    } finally { setBusy(false); }
  }
  async function addToCart(product, buyNow = false) {
    const existing = cart.items.find(item => item.productId === product._id);
    const done = await act(() => api('/cart/items', { method: 'POST', body: JSON.stringify({
      productId: product._id, quantity: (existing?.quantity || 0) + 1
    }) }), 'Added to cart');
    if (done && buyNow) navigate('checkout');
  }
  async function setQuantity(item, quantity) {
    await act(() => api('/cart/items/' + item.productId, { method: 'PATCH', body: JSON.stringify({ quantity }) }), 'Cart updated');
  }
  async function removeCart(item) {
    await act(() => api('/cart/items/' + item.productId, { method: 'DELETE' }), 'Removed from cart');
  }
  async function toggleWish(product) {
    const isSaved = wishlist.some(item => item._id === product._id);
    await act(() => api('/wishlist/' + product._id, { method: isSaved ? 'DELETE' : 'POST' }),
      isSaved ? 'Removed from wishlist' : 'Saved to wishlist');
  }
  function openCategory(next) { navigate('shop?category=' + encodeURIComponent(next)); }
  function search(event) {
    event.preventDefault();
    navigate('shop?q=' + encodeURIComponent(searchDraft.trim()));
    if (route.page === 'shop') { setQuery(searchDraft.trim()); setCategory(''); }
  }
  async function applyCoupon(event) {
    event.preventDefault();
    setCoupon(couponDraft.trim().toUpperCase());
    try { await reloadCart(couponDraft.trim().toUpperCase()); setNotice('Coupon applied to demo total'); }
    catch (error) { setNotice(error.message); }
  }
  async function placeOrder(event) {
    event.preventDefault();
    setFormError('');
    if (!address.fullName.trim() || !/^\d{10}$/.test(address.phone) ||
      !address.address.trim() || !address.city.trim() || !address.state.trim() || !/^\d{6}$/.test(address.pincode)) {
      setFormError('Please enter your name, complete address, 10-digit mobile number and 6-digit PIN code.');
      return;
    }
    setBusy(true);
    try {
      const order = await api('/orders', { method: 'POST', body: JSON.stringify({ delivery: address, paymentMethod, coupon }) });
      await reloadAll();
      setCoupon(''); setCouponDraft('');
      navigate('success/' + order.orderId);
    } catch (error) { setFormError(error.message); }
    finally { setBusy(false); }
  }
  const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const cartSavings = cart.items.reduce((sum, item) => sum + Math.max(0, (item.mrp || item.price) - item.price) * item.quantity, 0);
  const currentProduct = products.find(p => p._id === route.id);
  const currentOrder = orders.find(o => o._id === route.id);
  const deals = products.filter(p => savings(p) >= 40).slice(0, 8);
  const electronics = products.filter(p => p.category === 'Electronics').slice(0, 6);
  const home = products.filter(p => ['Home', 'Appliances'].includes(p.category)).slice(0, 6);
  const wishSet = useMemo(() => new Set(wishlist.map(x => x._id)), [wishlist]);

  function productCard(product) {
    const isSaved = wishSet.has(product._id);
    return <article className="product-card" key={product._id}>
      <button className="wishlist-icon" aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'} title="Wishlist" onClick={() => toggleWish(product)} disabled={busy}>
        <Heart size={18} fill={isSaved ? 'currentColor' : 'none'}/></button>
      {product.badge && <span className="card-badge">{product.badge}</span>}
      <button className="product-cover-button" onClick={() => navigate('product/' + product._id)}>
        <ProductImage product={product} className="card-photo"/>
      </button>
      <div className="card-content">
        <span className="card-brand">{product.brand}</span>
        <button className="product-title" onClick={() => navigate('product/' + product._id)}>{product.name}</button>
        <div className="review-row"><Rating product={product}/><span>({Number(product.reviewCount || 0).toLocaleString('en-IN')})</span></div>
        <div className="pricing"><strong>{money(product.price)}</strong><del>{money(product.mrp || product.price)}</del></div>
        <div className="discount">{savings(product)}% off <span>• Free delivery</span></div>
        <button className="mini-add" disabled={busy || product.stock <= 0} onClick={() => addToCart(product)}>
          <Plus size={15}/> {product.stock <= 0 ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </article>;
  }
  function shelf(title, desc, items, target, eyebrow) {
    return <section className="shelf">
      <SectionHeading title={title} subtitle={desc} eyebrow={eyebrow} onMore={() => navigate(target)}/>
      {items.length ? <div className="product-grid">{items.map(productCard)}</div>
        : <div className="loading-grid">{Array.from({ length: 5 }, (_, index) => <div className="skeleton-card" key={index}/>)}</div>}
    </section>;
  }
  function priceBreakdown(showButton = false) {
    return <div className="price-box">
      <div className="price-box-title">PRICE DETAILS</div>
      <div className="price-line"><span>Price ({count} item{count === 1 ? '' : 's'})</span><span>{money(cart.subtotal + cartSavings)}</span></div>
      <div className="price-line green"><span>Product savings</span><span>−{money(cartSavings)}</span></div>
      <div className="price-line green"><span>Coupon discount</span><span>−{money(cart.discount)}</span></div>
      <div className="price-line"><span>Delivery charges</span><span className="green">FREE</span></div>
      <div className="price-total"><strong>Total amount</strong><strong>{money(cart.total)}</strong></div>
      <div className="you-save">You'll save {money(cartSavings + cart.discount)} on this demo order</div>
      {showButton && <button className="btn btn-orange full" disabled={!count || busy} onClick={() => navigate('checkout')}>
        Place order <ArrowRight size={18}/>
      </button>}
      <p className="secure-note"><ShieldCheck size={15}/> Simulated checkout • No real payments collected</p>
    </div>;
  }

  return <div className="app-shell">
    <div className="top-strip"><span>FASTER SHOPPING. BETTER EVERYDAY DEALS.</span><span>Free demo delivery on all products <Truck size={13}/></span></div>
    <header className="site-header">
      <div className="header-inner">
        <button className="mobile-menu" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
        <button className="brand" aria-label="FaultKart home" onClick={() => navigate('')}>
          <span className="brand-mark">F<span>★</span></span>
          <span className="brand-name">fault<span>kart</span><small>Explore your everyday <Zap size={10} fill="currentColor"/></small></span>
        </button>
        <form className="search-bar" onSubmit={search}>
          <Search size={21} className="search-ico"/>
          <input aria-label="Search the marketplace" placeholder="Search for products, brands and more" value={searchDraft} onChange={event => setSearchDraft(event.target.value)}/>
          <button type="submit" aria-label="Search products"><Search size={21}/></button>
        </form>
        <div className="header-actions">
          <button className="header-action location-action" onClick={() => navigate('checkout')} title="Delivery address"><MapPin size={19}/><span><small>Deliver to</small>India</span></button>
          <button className="header-action" onClick={() => navigate('orders')}><UserRound size={20}/><span><small>Hello, guest</small>My orders</span></button>
          <button className="header-action icon-only" aria-label="Wishlist" onClick={() => navigate('wishlist')}><Heart size={22}/>{wishlist.length > 0 && <b className="count-badge">{wishlist.length}</b>}</button>
          <button className="header-action cart-action" onClick={() => navigate('cart')}><ShoppingCart size={23}/><span>Cart</span>{count > 0 && <b className="count-badge">{count}</b>}</button>
        </div>
      </div>
    </header>
    <nav className={'category-nav ' + (menuOpen ? 'show' : '')} aria-label="Departments">
      <div className="nav-inner">
        <button className="nav-all" onClick={() => navigate('shop')}><Grid2X2 size={16}/> All categories</button>
        {categories.map(({ label, icon: Icon }) => <button key={label} onClick={() => openCategory(label)}><Icon size={16}/>{label}</button>)}
        <button className="deal-link" onClick={() => navigate('shop?sort=price-asc')}><Zap size={15}/> Today's deals</button>
      </div>
    </nav>

    {notice && <div className="toast" role="status"><CheckCircle2 size={17}/>{notice}<button aria-label="Dismiss notification" onClick={() => setNotice('')}><X size={14}/></button></div>}
    {backendError && <div className="connection-error" role="alert"><AlertCircle size={21}/><div><strong>Storefront couldn't connect to the API.</strong>
      <p>{backendError}. Start MongoDB and run <code>npm run dev</code>. The local API auto-seeds the catalog on startup.</p></div><button onClick={() => location.reload()}>Retry</button></div>}
    <main>
      {route.page === 'home' && <>
        <div className="hero-layout">
          <section className="hero">
            <div className="hero-dots" aria-hidden="true"></div>
            <div className="hero-copy">
              <span className="hero-pill"><Zap size={14} fill="currentColor"/> THE BIG SAVINGS EDIT</span>
              <h1>Big finds.<br/><span>Better prices.</span></h1>
              <p>Everything you love, from everyday essentials to your next big upgrade.</p>
              <button className="btn btn-light" onClick={() => navigate('shop')}>Shop the collection <ArrowRight size={18}/></button>
              <div className="hero-proof"><span><BadgeCheck size={15}/> Curated picks</span><span><Truck size={16}/> Free demo delivery</span></div>
            </div>
            <div className="hero-visual">
              <div className="hero-glow"></div>
              <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=88" alt="Premium headphones"/>
              <div className="hero-price"><small>DEALS FROM</small><strong>₹249</strong></div>
            </div>
          </section>
          <div className="hero-side">
            <div className="side-promo promo-fashion"><span>THE STYLE DROP</span><h3>New season,<br/>new energy.</h3><button onClick={() => openCategory('Fashion')}>Shop fashion <ArrowRight size={15}/></button><Shirt size={86} strokeWidth={1.1}/></div>
            <div className="side-promo promo-home"><span>YOUR SPACE, REIMAGINED</span><h3>Home finds<br/>you'll love.</h3><button onClick={() => openCategory('Home')}>Shop home <ArrowRight size={15}/></button><House size={83} strokeWidth={1.1}/></div>
          </div>
        </div>
        <section className="benefits">
          <div><Truck size={24}/><span><strong>Free demo delivery</strong><small>On every order</small></span></div>
          <div><ShieldCheck size={24}/><span><strong>Safe demo checkout</strong><small>No real transactions</small></span></div>
          <div><RotateCcw size={24}/><span><strong>Easy shopping journey</strong><small>Browse, cart & order</small></span></div>
          <div><Headset size={24}/><span><strong>Made for exploration</strong><small>Test the full experience</small></span></div>
        </section>
        <section className="category-section">
          <SectionHeading eyebrow="EXPLORE FAULTKART" title="Shop by category" subtitle="Your favourite departments, all in one place"/>
          <div className="category-grid">{categories.map(({ label, icon: Icon, color }) => <button key={label} className="category-card" onClick={() => openCategory(label)}>
            <span className={'category-visual ' + color}><Icon size={36} strokeWidth={1.65}/></span><strong>{label}</strong><span className="category-arrow"><ArrowRight size={14}/></span>
          </button>)}</div>
        </section>
        {shelf('Deals you cannot miss', 'Great prices on the good stuff.', deals, 'shop?sort=price-asc', 'LIMITED-TIME PICKS')}
        <section className="wide-promo">
          <div><span className="eyebrow">MADE FOR YOUR EVERYDAY</span><h2>Upgrade your setup.<br/>Not your spending.</h2><p>Explore electronics, accessories and smart essentials.</p><button className="btn btn-dark" onClick={() => openCategory('Electronics')}>Explore tech <ArrowRight size={17}/></button></div>
          <div className="wide-promo-art"><Headphones size={128} strokeWidth={1.2}/><span>SMARTER<br/>CHOICES.</span></div>
        </section>
        {shelf('Tech worth checking out', 'Discover your next favourite gadget.', electronics, 'shop?category=Electronics', 'TOP TECH PICKS')}
        {shelf('Make home your happy place', 'Small upgrades, big difference.', home, 'shop?category=Home', 'HOME & LIVING')}
        <section className="bottom-invite"><Gift size={34}/><div><h3>There is more to discover.</h3><p>Browse all categories and find something new today.</p></div><button className="btn btn-light" onClick={() => navigate('shop')}>Explore all products <ArrowRight size={17}/></button></section>
      </>}

      {route.page === 'shop' && <div className="shop-page">
        <div className="breadcrumbs"><button onClick={() => navigate('')}>Home</button><ChevronRight size={14}/><span>{category || (query ? 'Search results' : 'All products')}</span></div>
        <div className="shop-heading"><div><span className="eyebrow">YOUR MARKETPLACE</span><h1>{query ? 'Results for "' + query + '"' : category || 'All products'}</h1><p>{results.length} products to discover</p></div><button className="filters-mobile"><SlidersHorizontal size={18}/> Filters</button></div>
        <div className="shop-layout">
          <aside className="filter-sidebar">
            <div className="filter-title"><h3><SlidersHorizontal size={18}/> Filters</h3><button onClick={() => { setCategory(''); setQuery(''); setSearchDraft(''); setSort('name'); navigate('shop'); }}>Clear all</button></div>
            <h4>CATEGORIES</h4>
            <button className={!category ? 'filter-selected' : ''} onClick={() => setCategory('')}>All products</button>
            {categories.map(c => <button key={c.label} className={category === c.label ? 'filter-selected' : ''} onClick={() => setCategory(c.label)}>{c.label}</button>)}
            <div className="filter-tip"><Tag size={19}/><p><strong>Everyday prices</strong><br/>Explore deals across your favourite categories.</p></div>
          </aside>
          <section className="shop-results"><div className="shop-toolbar"><span>Showing <strong>{results.length}</strong> products</span><label>Sort by <select value={sort} onChange={event => setSort(event.target.value)}><option value="name">Relevance</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option><option value="rating">Customer rating</option></select></label></div>
            {results.length ? <div className="product-grid shop-grid">{results.map(productCard)}</div> : <Empty icon={Search} title="No products found" description="Try searching for something else or switching categories." action={() => navigate('shop')} actionLabel="Browse all products"/>}
          </section>
        </div>
      </div>}

      {route.page === 'product' && (currentProduct ? <>
        <div className="breadcrumbs"><button onClick={() => navigate('')}>Home</button><ChevronRight size={14}/><button onClick={() => openCategory(currentProduct.category)}>{currentProduct.category}</button><ChevronRight size={14}/><span>{currentProduct.name}</span></div>
        <div className="detail-layout">
          <div className="detail-media"><div className="detail-photo-wrap"><ProductImage product={currentProduct} className="detail-photo"/></div>
            <div className="detail-actions"><button className="btn btn-outline" disabled={busy || currentProduct.stock <= 0} onClick={() => addToCart(currentProduct)}><ShoppingCart size={20}/> ADD TO CART</button>
              <button className="btn btn-orange" disabled={busy || currentProduct.stock <= 0} onClick={() => addToCart(currentProduct, true)}><Zap size={18}/> BUY NOW</button></div></div>
          <div className="detail-info">
            <div className="eyebrow">{currentProduct.brand} / {currentProduct.category}</div>
            <h1>{currentProduct.name}</h1>
            <div className="detail-review"><Rating product={currentProduct}/><span>{Number(currentProduct.reviewCount || 0).toLocaleString('en-IN')} ratings & reviews</span><BadgeCheck size={18}/></div>
            <div className="detail-divider"></div>
            <span className="detail-price-kicker">Special price</span>
            <div className="detail-prices"><strong>{money(currentProduct.price)}</strong><del>{money(currentProduct.mrp || currentProduct.price)}</del><b>{savings(currentProduct)}% off</b></div>
            <p className="tax-note">Inclusive of all taxes. Demo price, no real transaction.</p>
            <div className="offer-box"><h3><Tag size={18}/> Available offers</h3><p><BadgeCheck size={16}/> Demo offer: use <strong>SAVE10</strong> in cart</p><p><BadgeCheck size={16}/> Free demo delivery on this product</p><p><BadgeCheck size={16}/> Discover more special-price finds</p></div>
            <div className="delivery-detail"><Truck size={21}/><div><strong>Delivery</strong><p>Free demo delivery across India</p></div></div>
            <div className="delivery-detail"><ShieldCheck size={21}/><div><strong>Shop with confidence</strong><p>Local sample store • simulated payments only</p></div></div>
            <div className="detail-divider"></div><h3>Product highlights</h3>
            <p className="description">{currentProduct.description}</p>
            <ul className="feature-list">{(currentProduct.features || []).map(feature => <li key={feature}><CheckCircle2 size={16}/>{feature}</li>)}</ul>
            <button className="wish-inline" onClick={() => toggleWish(currentProduct)} disabled={busy}><Heart size={18} fill={wishSet.has(currentProduct._id) ? 'currentColor' : 'none'}/>{wishSet.has(currentProduct._id) ? 'Saved to wishlist' : 'Add to wishlist'}</button>
          </div>
        </div>
        {shelf('You may also like', 'More from this category', products.filter(p => p.category === currentProduct.category && p._id !== currentProduct._id).slice(0, 5), 'shop?category=' + encodeURIComponent(currentProduct.category))}
      </> : <Empty title="Product not found" description="The product may no longer be available." action={() => navigate('shop')}/>)}

      {route.page === 'cart' && <div className="inner-page">
        <div className="breadcrumbs"><button onClick={() => navigate('')}>Home</button><ChevronRight size={14}/><span>Shopping cart</span></div>
        <SectionHeading title="Your shopping cart" subtitle={count + ' item' + (count === 1 ? '' : 's') + ' in your bag'}/>
        {count ? <div className="checkout-layout">
          <section className="cart-panel"><div className="cart-panel-head"><ShoppingBag size={19}/><strong>My cart ({count})</strong><span><Truck size={15}/> Free delivery</span></div>
            {cart.items.map(item => <div className="cart-item" key={item.productId}>
              <ProductImage product={item} className="cart-image"/>
              <div className="cart-item-content"><h3>{item.name}</h3><p>{item.sku} · In stock: {item.stock}</p><div className="pricing"><strong>{money(item.price)}</strong><del>{money(item.mrp || item.price)}</del><b>{savings(item)}% off</b></div>
                <div className="quantity-row"><div className="qty-control"><button disabled={busy || item.quantity <= 1} onClick={() => setQuantity(item, item.quantity - 1)}><Minus size={14}/></button><span>{item.quantity}</span><button disabled={busy || item.quantity >= 20} onClick={() => setQuantity(item, item.quantity + 1)}><Plus size={14}/></button></div><button className="remove-btn" onClick={() => removeCart(item)} disabled={busy}><Trash2 size={16}/> Remove</button></div>
              </div>
            </div>)}
            <div className="cart-footer"><button className="text-link" onClick={() => navigate('shop')}><ArrowLeft size={16}/> Continue shopping</button><button className="btn btn-orange" onClick={() => navigate('checkout')}>PLACE ORDER <ArrowRight size={16}/></button></div>
          </section>
          <aside className="summary-column"><div className="coupon-box"><h3><Tag size={18}/> Have a coupon?</h3><form onSubmit={applyCoupon}><input aria-label="Coupon code" placeholder="Enter coupon code" value={couponDraft} onChange={event => setCouponDraft(event.target.value)}/><button type="submit" disabled={busy}>Apply</button></form><p>Try SAVE10 or FLAT100 (demo only)</p></div>{priceBreakdown()}</aside>
        </div> : <Empty icon={ShoppingCart} title="Your cart feels a little empty" description="Find something you love and add it to your shopping cart." action={() => navigate('shop')}/>}
      </div>}

      {route.page === 'checkout' && <div className="inner-page">
        <div className="breadcrumbs"><button onClick={() => navigate('')}>Home</button><ChevronRight size={14}/><button onClick={() => navigate('cart')}>Cart</button><ChevronRight size={14}/><span>Checkout</span></div>
        <SectionHeading title="Secure demo checkout" subtitle="One last step before your items are on their way (simulated)"/>
        {!count ? <Empty title="Nothing to check out yet" description="Add items to your cart to continue." action={() => navigate('shop')}/> :
          <div className="checkout-layout">
            <form className="checkout-form" onSubmit={placeOrder}>
              <div className="checkout-step"><span>1</span><h3>Delivery address</h3></div>
              <div className="form-grid">
                <label>Full name <input required value={address.fullName} maxLength={100} onChange={e => setAddress({ ...address, fullName: e.target.value })} placeholder="Your full name"/></label>
                <label>Mobile number <input required type="tel" inputMode="numeric" maxLength={10} value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} placeholder="10-digit mobile number"/></label>
                <label className="wide">Address <textarea required rows={3} maxLength={200} value={address.address} onChange={e => setAddress({ ...address, address: e.target.value })} placeholder="House, street, apartment or landmark"/></label>
                <label>City <input required maxLength={100} value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} placeholder="City"/></label>
                <label>State <input required maxLength={100} value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} placeholder="State"/></label>
                <label>PIN code <input required inputMode="numeric" maxLength={6} value={address.pincode} onChange={e => setAddress({ ...address, pincode: e.target.value })} placeholder="6-digit PIN code"/></label>
              </div>
              <div className="checkout-step"><span>2</span><h3>Payment method</h3></div>
              <div className="payment-options"><label className={paymentMethod === 'cod' ? 'selected' : ''}><input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')}/><Wallet size={23}/><span><strong>Cash on delivery (demo)</strong><small>Simulated order, no payment collected</small></span></label>
                <label className={paymentMethod === 'demo-online' ? 'selected' : ''}><input type="radio" name="payment" value="demo-online" checked={paymentMethod === 'demo-online'} onChange={() => setPaymentMethod('demo-online')}/><CreditCard size={23}/><span><strong>Online payment (simulation)</strong><small>No payment gateway or real transaction</small></span></label></div>
              <div className="checkout-step"><span>3</span><h3>Review & place your order</h3></div>
              <div className="checkout-mini-items">{cart.items.map(item => <div key={item.productId}><span>{item.name} × {item.quantity}</span><strong>{money(item.price * item.quantity)}</strong></div>)}</div>
              {formError && <p className="form-error"><AlertCircle size={17}/>{formError}</p>}
              <button type="submit" className="btn btn-orange full large" disabled={busy}>{busy ? 'Placing demo order...' : 'PLACE DEMO ORDER'} <ArrowRight size={18}/></button>
              <p className="secure-note"><Info size={15}/> This is a training store. Do not enter real personal information.</p>
            </form>
            <aside className="summary-column">{priceBreakdown()}</aside>
          </div>}
      </div>}

      {route.page === 'success' && <div className="success-page"><div className="success-icon"><CheckCircle2 size={48}/></div><span className="eyebrow">ORDER CONFIRMED</span><h1>It's officially on the list!</h1><p>Your demo order was placed successfully. No real payment or delivery will take place.</p><div className="success-details"><span>Order ID</span><strong>#{route.id.slice(-8).toUpperCase()}</strong>{currentOrder && <><span>Order total</span><strong>{money(currentOrder.total)}</strong><span>Status</span><strong>Placed</strong></>}</div><div className="success-actions"><button className="btn btn-primary" onClick={() => navigate('orders')}>View my orders <Package size={18}/></button><button className="btn btn-outline" onClick={() => navigate('shop')}>Continue shopping</button></div></div>}

      {route.page === 'orders' && <div className="inner-page">
        <div className="breadcrumbs"><button onClick={() => navigate('')}>Home</button><ChevronRight size={14}/><span>My orders</span></div>
        <SectionHeading title="My orders" subtitle="Your simulated purchases, all in one place"/>
        {orders.length ? <div className="order-list">{orders.map(order => <div className="order-card" key={order._id}>
          <div className="order-card-head"><span><Package size={17}/> Order #{order._id.slice(-8).toUpperCase()}</span><span className="order-status"><CheckCircle2 size={15}/> {order.status || 'Placed'}</span></div>
          <div className="order-card-body">{order.lines.map((item, idx) => <div className="order-line" key={idx}><ProductImage product={item} className="order-thumb"/><div><strong>{item.name}</strong><small>Quantity: {item.quantity}</small></div></div>)}</div>
          <div className="order-card-foot"><span>Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span><strong>{money(order.total)}</strong></div>
        </div>)}</div> : <Empty icon={Package} title="No orders yet" description="Your demo orders will show up here after checkout." action={() => navigate('shop')}/>}
      </div>}

      {route.page === 'wishlist' && <div className="inner-page">
        <div className="breadcrumbs"><button onClick={() => navigate('')}>Home</button><ChevronRight size={14}/><span>Wishlist</span></div>
        <SectionHeading title="Your wishlist" subtitle="Good things are worth saving"/>
        {wishlist.length ? <div className="product-grid">{wishlist.map(productCard)}</div>
          : <Empty icon={Heart} title="Your wishlist is waiting" description="Tap the heart on anything that catches your eye." action={() => navigate('shop')}/>}
      </div>}
    </main>
    <footer className="site-footer">
      <div className="footer-inner"><div className="footer-brand"><strong>fault<span>kart</span><span className="footer-star">★</span></strong><p>Everything you want, all in one place.<br/>A better way to explore everyday shopping.</p></div>
        <div><h4>Shop</h4><button onClick={() => navigate('shop')}>All products</button><button onClick={() => openCategory('Electronics')}>Electronics</button><button onClick={() => openCategory('Fashion')}>Fashion</button><button onClick={() => openCategory('Home')}>Home & living</button></div>
        <div><h4>My account</h4><button onClick={() => navigate('cart')}>My cart</button><button onClick={() => navigate('wishlist')}>Wishlist</button><button onClick={() => navigate('orders')}>Order history</button></div>
        <div><h4>About FaultKart</h4><p>Built as an intentionally imperfect MERN application for developer debugging challenges.</p><p>No live payments or real deliveries.</p></div>
      </div>
      <div className="footer-bottom"><span>© 2026 FaultKart Demo Marketplace. Educational use only.</span><span><ShieldCheck size={15}/> Demo checkout · No real transactions</span></div>
    </footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
