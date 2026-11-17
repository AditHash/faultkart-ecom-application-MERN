import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CheckCircle2, X, AlertCircle } from 'lucide-react';
import { api, getRoute, navigate, StoreContext } from './lib.js';
import { Header, Footer } from './Header.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import Product from './pages/Product.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import { Success, OrderList, OrderDetail } from './pages/Orders.jsx';
import Account from './pages/Account.jsx';
import { Login, Seller, Help, Travel, Minutes, Offers, Wishlist, SharedWishlist, InfoPage } from './pages/Services.jsx';
import './style.css';

const initialCart = { items: [], subtotal: 0, discount: 0, total: 0 };

function App() {
  const [route, setRoute] = useState(getRoute());
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(initialCart);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [me, setMe] = useState(null);
  const [saved, setSaved] = useState([]);
  const [recent, setRecent] = useState([]);
  const [backendError, setBackendError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [couponDraft, setCouponDraft] = useState('');
  const [coupon, setCoupon] = useState('');

  useEffect(() => {
    const updateRoute = () => setRoute(getRoute());
    window.addEventListener('hashchange', updateRoute);
    return () => window.removeEventListener('hashchange', updateRoute);
  }, []);
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(''), 4500);
    return () => clearTimeout(timer);
  }, [notice]);

  async function reloadCart(nextCoupon = coupon) {
    setCart(await api('/cart?coupon=' + encodeURIComponent(nextCoupon)));
  }
  async function refreshMe() {
    const [profile, savedItems] = await Promise.all([api('/me'), api('/saved')]);
    setMe(profile); setSaved(savedItems);
  }
  async function reloadAll(nextCoupon = coupon) {
    const [all, nextCart, nextWishlist, nextOrders] = await Promise.all([
      api('/products'), api('/cart?coupon=' + encodeURIComponent(nextCoupon)), api('/wishlist'), api('/orders')
    ]);
    setProducts(all);
    setCart(nextCart);
    setWishlist(nextWishlist);
    setOrders(nextOrders);
    setBackendError('');
    refreshMe().catch(() => {});
  }
  useEffect(() => {
    let active = true;
    Promise.all([api('/products'), api('/cart'), api('/wishlist'), api('/orders')])
      .then(([all, basket, favourites, history]) => {
        if (!active) return;
        setProducts(all); setCart(basket); setWishlist(favourites); setOrders(history);
        setBackendError('');
      })
      .catch(error => { if (active) setBackendError(error.message); });
    refreshMe().catch(() => {});
    api('/me/recent').then(items => { if (active) setRecent(items); }).catch(() => {});
    return () => { active = false; };
  }, []);

  async function act(operation, success = 'Updated successfully') {
    if (busy) return false;
    setBusy(true);
    try {
      await operation();
      try {
        await reloadAll();
        setNotice(success);
      } catch {
        setNotice(success + '. Some details could not refresh; reload the page to see the latest information.');
      }
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
  async function saveForLater(item) {
    await act(() => api('/cart/items/' + item.productId + '/save-for-later', { method: 'POST' }), 'Saved for later');
  }
  async function moveToCart(product) {
    await act(() => api('/saved/' + product._id + '/move-to-cart', { method: 'POST' }), 'Moved to cart');
  }
  async function removeSaved(product) {
    await act(() => api('/saved/' + product._id, { method: 'DELETE' }), 'Removed from saved items');
  }
  async function toggleWish(product) {
    const isSaved = wishlist.some(item => item._id === product._id);
    await act(() => api('/wishlist/' + product._id, { method: isSaved ? 'DELETE' : 'POST' }),
      isSaved ? 'Removed from wishlist' : 'Saved to wishlist');
  }
  async function applyCoupon(event) {
    event.preventDefault();
    const nextCoupon = couponDraft.trim().toUpperCase();
    if (nextCoupon && !['SAVE10', 'FLAT100'].includes(nextCoupon)) {
      setNotice('Coupon not recognised. Try SAVE10 or FLAT100.');
      return;
    }
    try {
      await reloadCart(nextCoupon);
      setCoupon(nextCoupon);
      setNotice(nextCoupon ? 'Coupon applied to demo total' : 'Coupon removed');
    }
    catch (error) { setNotice(error.message); }
  }
  function rememberView(product) {
    api('/me/recent/' + product._id, { method: 'POST' })
      .then(() => setRecent(current => [product, ...current.filter(p => p._id !== product._id)].slice(0, 12))).catch(() => {});
  }
  async function login(form) {
    const profile = await api('/auth/login', { method: 'POST', body: JSON.stringify(form) });
    setMe(profile);
    setNotice('Welcome, ' + profile.name + '!');
  }
  async function logout() {
    await act(() => api('/auth/logout', { method: 'POST' }), 'You have been logged out');
    navigate('');
  }

  const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const wishSet = useMemo(() => new Set(wishlist.map(x => x._id)), [wishlist]);
  const store = {
    route, products, cart, wishlist, orders, me, saved, recent, busy, setBusy, count, wishSet, coupon, couponDraft, setCouponDraft,
    act, addToCart, setQuantity, removeCart, saveForLater, moveToCart, removeSaved, toggleWish, applyCoupon, rememberView,
    login, logout, reloadAll, refreshMe, setBackendError, notify: setNotice,
    clearCoupon: () => { setCoupon(''); setCouponDraft(''); }
  };

  const pages = {
    home: Home, shop: Shop, product: Product, cart: Cart, checkout: Checkout, success: Success, wishlist: Wishlist,
    orders: route.id ? OrderDetail : OrderList, account: Account, login: Login, seller: Seller, help: Help,
    travel: Travel, minutes: Minutes, offers: Offers, page: InfoPage, shared: SharedWishlist
  };
  const Page = pages[route.page] || Home;

  return <StoreContext.Provider value={store}>
    <div className="app-shell">
      <Header/>
      {notice && <div className="toast" role="status"><CheckCircle2 size={17}/>{notice}<button aria-label="Dismiss notification" onClick={() => setNotice('')}><X size={14}/></button></div>}
      {backendError && <div className="connection-error" role="alert"><AlertCircle size={21}/><div><strong>Storefront couldn't connect to the API.</strong>
        <p>{backendError}. Start MongoDB and run <code>npm run dev</code>. The local API auto-seeds the catalog on startup.</p></div><button onClick={() => location.reload()}>Retry</button></div>}
      <main className={'page-' + route.page}><Page key={route.page === 'shop' ? 'shop' : route.key}/></main>
      <Footer/>
    </div>
  </StoreContext.Provider>;
}
createRoot(document.getElementById('root')).render(<App/>);
