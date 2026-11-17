import React, { useEffect, useRef, useState } from 'react';
import {
  Search, ShoppingCart, Heart, CircleUserRound, MapPin, ChevronDown, ChevronRight, Package, Ticket, Coins, Crown,
  CreditCard, Gift, Bell, LogOut, Store, Headset, Megaphone, Download, Zap, Plane, ShoppingBag, Shirt, Smartphone,
  Laptop, Sparkles, House, Refrigerator, ToyBrick, Apple, Dumbbell, BookOpen, Sofa, Watch, Menu, X
} from 'lucide-react';
import { api, navigate, imageUrl, useStore, savedPincode, storePincode } from './lib.js';

export const categoryIcons = {
  'For You': ShoppingBag, Fashion: Shirt, Mobiles: Smartphone, Electronics: Laptop, Beauty: Sparkles, Home: House,
  Appliances: Refrigerator, Toys: ToyBrick, Grocery: Apple, Sports: Dumbbell, Books: BookOpen, Furniture: Sofa, Accessories: Watch
};

function useOutsideClose(open, setOpen) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = event => { if (ref.current && !ref.current.contains(event.target)) setOpen(false); };
    const escape = event => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', escape); };
  }, [open]);
  return ref;
}

function SearchBox() {
  const { route } = useStore();
  const [draft, setDraft] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, setOpen);
  useEffect(() => { if (route.page === 'shop') setDraft(route.params.get('q') || ''); }, [route.key]);
  useEffect(() => {
    if (!draft.trim()) { setSuggestions([]); return undefined; }
    const timer = setTimeout(() => {
      api('/search/suggest?q=' + encodeURIComponent(draft.trim())).then(setSuggestions).catch(() => setSuggestions([]));
    }, 120);
    return () => clearTimeout(timer);
  }, [draft]);
  function go(term) {
    setOpen(false);
    navigate('shop?q=' + encodeURIComponent(term.trim()));
  }
  return <form className="search-bar" ref={ref} onSubmit={event => { event.preventDefault(); go(draft); }}>
    <Search size={20} className="search-ico"/>
    <input aria-label="Search the marketplace" placeholder="Search for Products, Brands and More" value={draft} autoComplete="off"
      onFocus={() => setOpen(true)} onChange={event => { setDraft(event.target.value); setOpen(true); }}/>
    <button type="submit" aria-label="Search products"><Search size={19}/></button>
    {open && suggestions.length > 0 && <ul className="suggestions" role="listbox" aria-label="Search suggestions">
      {suggestions.map(item => <li key={item._id}><button type="button" onClick={() => go(item.name)}>
        <img src={imageUrl(item.image, 200)} alt=""/><span>{item.name.toLowerCase()}<small>in {item.category}</small></span>
      </button></li>)}
    </ul>}
  </form>;
}

function LocationPicker() {
  const [open, setOpen] = useState(false);
  const [pincode, setPincode] = useState(savedPincode());
  const [draft, setDraft] = useState(pincode);
  const [error, setError] = useState('');
  const ref = useOutsideClose(open, setOpen);
  function apply(event) {
    event.preventDefault();
    if (!/^[1-9]\d{5}$/.test(draft)) { setError('Enter a valid 6-digit pincode'); return; }
    storePincode(draft); setPincode(draft); setError(''); setOpen(false);
    window.dispatchEvent(new Event('faultkart-pincode'));
  }
  return <div className="location" ref={ref}>
    <button className="location-btn" onClick={() => setOpen(!open)}><MapPin size={16}/>{pincode ? <strong>{pincode}</strong> : null}
      <span>{pincode ? 'Change location' : 'Select delivery location'}</span><ChevronRight size={14}/></button>
    {open && <form className="popover location-pop" onSubmit={apply}>
      <strong>Choose your delivery location</strong>
      <p>Enter a pincode to see product availability and delivery options.</p>
      <div className="inline-form"><input aria-label="Delivery pincode" inputMode="numeric" maxLength={6} value={draft} onChange={e => setDraft(e.target.value)} placeholder="Enter pincode"/><button className="btn btn-primary">Apply</button></div>
      {error && <small className="field-error">{error}</small>}
    </form>}
  </div>;
}

const accountLinks = [
  ['My Profile', 'account', CircleUserRound], ['Orders', 'orders', Package], ['Coupons', 'account/coupons', Ticket],
  ['SuperCoin', 'account/coins', Coins], ['FaultKart Plus Zone', 'account/plus', Crown],
  ['Saved Cards & Wallet', 'account/payments', CreditCard], ['Saved Addresses', 'account/addresses', MapPin],
  ['Wishlist', 'wishlist', Heart], ['Gift Cards', 'account/giftcards', Gift], ['Notifications', 'account/notifications', Bell]
];
const moreLinks = [
  ['Become a Seller', 'seller', Store], ['Notification Preferences', 'account/notifications', Bell],
  ['24x7 Customer Care', 'help', Headset], ['Advertise', 'page/advertise', Megaphone], ['Download App', 'page/app', Download]
];

function Dropdown({ label, icon: Icon, items, header, footer, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, setOpen);
  return <div className={'dropdown ' + className} ref={ref} onMouseLeave={() => setOpen(false)}>
    <button className="header-link" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen(!open)} onMouseEnter={() => setOpen(true)}>
      {Icon && <Icon size={21}/>}<span>{label}</span><ChevronDown size={15} className={open ? 'flip' : ''}/></button>
    {open && <div className="popover menu-pop" role="menu">
      {header}
      {items.map(([text, to, ItemIcon, onClick]) => <button role="menuitem" key={text} onClick={() => { setOpen(false); onClick ? onClick() : navigate(to); }}>
        <ItemIcon size={18}/>{text}</button>)}
      {footer}
    </div>}
  </div>;
}

export function Header() {
  const { me, count, wishlist, logout, route } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [route.key]);
  const accountItems = me?.loggedIn ? [...accountLinks, ['Logout', '', LogOut, logout]] : accountLinks;
  const activeCategory = route.page === 'shop' ? route.params.get('category') : route.page === 'home' ? 'For You' : '';
  return <>
    <header className="site-header">
      <div className="header-row top-row">
        <button className="mobile-menu" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
        <nav className="app-tabs" aria-label="FaultKart apps">
          <button className={'app-tab brand-tab' + (route.page === 'home' ? ' active' : '')} aria-label="FaultKart home" onClick={() => navigate('')}>
            <span className="brand-mark">F</span><span className="brand-name">FaultKart</span></button>
          <button className={'app-tab' + (route.page === 'minutes' ? ' active' : '')} onClick={() => navigate('minutes')}><Zap size={16}/> Minutes</button>
          <button className={'app-tab' + (route.page === 'travel' ? ' active' : '')} onClick={() => navigate('travel')}><Plane size={16}/> Travel</button>
          <button className={'app-tab' + (route.params.get('category') === 'Grocery' && route.page === 'shop' ? ' active' : '')} onClick={() => navigate('shop?category=Grocery')}><Apple size={16}/> Grocery</button>
        </nav>
        <div className="top-right">
          <LocationPicker/>
          <button className="coin-pill" title="SuperCoins" onClick={() => navigate('account/coins')}><Coins size={15}/>{me?.supercoins ?? 0}</button>
        </div>
      </div>
      <div className="header-row main-row">
        <SearchBox/>
        <div className="header-actions">
          <Dropdown className="account-menu" label={me?.loggedIn ? me.name.split(' ')[0] || 'Account' : 'Login'} icon={CircleUserRound} items={accountItems}
            header={me?.loggedIn ? <div className="menu-title">Your Account</div>
              : <div className="menu-signup"><span>New customer?</span><button onClick={() => navigate('login?mode=signup')}>Sign Up</button></div>}/>
          <Dropdown className="more-menu" label="More" items={moreLinks}/>
          <button className="header-link icon-only" aria-label="Wishlist" onClick={() => navigate('wishlist')}><Heart size={21}/>{wishlist.length > 0 && <b className="count-badge">{wishlist.length}</b>}</button>
          <button className="header-link cart-link" onClick={() => navigate('cart')}><span className="cart-icon"><ShoppingCart size={22}/>{count > 0 && <b className="count-badge">{count}</b>}</span><span>Cart</span></button>
        </div>
      </div>
    </header>
    <nav className={'category-nav' + (menuOpen ? ' show' : '')} aria-label="Departments">
      <div className="nav-inner">
        {['For You', ...Object.keys(categoryIcons).filter(c => c !== 'For You')].map(label => {
          const Icon = categoryIcons[label];
          return <button key={label} className={activeCategory === label ? 'active' : ''}
            onClick={() => navigate(label === 'For You' ? '' : 'shop?category=' + encodeURIComponent(label))}>
            <span className="cat-icon"><Icon size={24} strokeWidth={1.6}/></span>{label}</button>;
        })}
      </div>
    </nav>
  </>;
}

export function Footer() {
  const link = (label, to) => <button key={label} onClick={() => navigate(to)}>{label}</button>;
  return <footer className="site-footer">
    <div className="footer-inner">
      <div><h4>ABOUT</h4>{link('Contact Us', 'help')}{link('About Us', 'page/about')}{link('Careers', 'page/careers')}{link('FaultKart Stories', 'page/stories')}{link('Press', 'page/press')}</div>
      <div><h4>GROUP COMPANIES</h4>{link('FaultKart Minutes', 'minutes')}{link('FaultKart Travel', 'travel')}{link('FaultKart Grocery', 'shop?category=Grocery')}{link('Offer Zone', 'offers')}</div>
      <div><h4>HELP</h4>{link('Payments', 'page/payments')}{link('Shipping', 'page/shipping')}{link('Cancellation & Returns', 'page/returns')}{link('FAQ', 'help')}</div>
      <div><h4>CONSUMER POLICY</h4>{link('Cancellation & Returns', 'page/returns')}{link('Terms Of Use', 'page/terms')}{link('Security', 'page/security')}{link('Privacy', 'page/privacy')}</div>
      <div className="footer-address"><h4>Mail Us:</h4><p>FaultKart Demo Marketplace,<br/>42 Sample Tech Park, Outer Ring Road,<br/>Bengaluru 560001, Karnataka, India<br/><em>(fictional address)</em></p></div>
      <div className="footer-address"><h4>Registered Office Address:</h4><p>FaultKart Training Labs,<br/>Building 7, Demo Avenue,<br/>Kolkata 700001, West Bengal, India<br/>Telephone: 000-0000-0000 (demo)</p></div>
    </div>
    <div className="footer-bottom">
      <button onClick={() => navigate('seller')}><Store size={15}/> Become a Seller</button>
      <button onClick={() => navigate('page/advertise')}><Megaphone size={15}/> Advertise</button>
      <button onClick={() => navigate('account/giftcards')}><Gift size={15}/> Gift Cards</button>
      <button onClick={() => navigate('help')}><Headset size={15}/> Help Center</button>
      <span>© 2026 FaultKart Demo Marketplace · Educational use only · No real payments or deliveries</span>
    </div>
  </footer>;
}
