import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Truck, ShieldCheck, RotateCcw, Headset } from 'lucide-react';
import { navigate, savings, money, imageUrl, useStore } from '../lib.js';
import { Shelf, Tile, SectionHeading } from '../components.jsx';
import { categoryIcons } from '../Header.jsx';

const banners = [
  { tone: 'violet', kicker: 'THE BIG SAVINGS EDIT', title: 'Big finds. Better prices.', copy: 'Up to 80% off on home essentials', cta: 'Shop home', to: 'shop?category=Home', sku: 'FK-118', heading: true },
  { tone: 'night', kicker: 'NEW LAUNCH', title: 'Pixelon 8 Pro 5G', copy: 'From ₹32,999* · 50MP camera · 120 Hz', cta: 'Buy now', to: 'shop?category=Mobiles', sku: 'FK-201' },
  { tone: 'sky', kicker: 'BEST PHONE UNDER ₹15K', title: 'VoltEdge G37 Power', copy: '6000 mAh battery · From ₹11,499*', cta: 'Explore', to: 'shop?category=Mobiles&sort=price-desc', sku: 'FK-204' },
  { tone: 'sunset', kicker: 'FURNITURE FEST', title: 'Living room makeover', copy: 'Sofas & chairs from ₹4,999', cta: 'Shop furniture', to: 'shop?category=Furniture', sku: 'FK-241' },
  { tone: 'mint', kicker: 'FAULTKART MINUTES', title: 'Groceries in minutes', copy: 'Milk, bread & fresh fruit at your door', cta: 'Order now', to: 'minutes', sku: 'FK-225' },
  { tone: 'rose', kicker: 'TOY STORE', title: 'Play time, all the time', copy: 'Building sets & plush toys · Min. 40% off', cta: 'Shop toys', to: 'shop?category=Toys', sku: 'FK-211' }
];

function Carousel({ products }) {
  const [index, setIndex] = useState(0);
  const pages = banners.length;
  useEffect(() => {
    const timer = setInterval(() => setIndex(i => (i + 1) % pages), 6000);
    return () => clearInterval(timer);
  }, [pages]);
  return <section className="carousel" aria-label="Offers">
    <div className="carousel-track" style={{ transform: 'translateX(calc(' + (-index) + ' * (var(--slide-w) + 16px)))' }}>
      {banners.map((banner, i) => {
        const product = products.find(p => p.sku === banner.sku);
        const Title = banner.heading ? 'h1' : 'h3';
        return <button key={banner.sku} className={'banner banner-' + banner.tone} onClick={() => navigate(banner.to)} tabIndex={i === index ? 0 : -1}>
          <div className="banner-copy"><span>{banner.kicker}</span><Title>{banner.title}</Title><p>{banner.copy}</p><em>{banner.cta} <ChevronRight size={15}/></em></div>
          {product && <img src={imageUrl(product.image, 400)} alt=""/>}
          <small>*T&C apply · Demo offer</small>
        </button>;
      })}
    </div>
    <button className="carousel-nav prev" aria-label="Previous offer" onClick={() => setIndex((index - 1 + pages) % pages)}><ChevronLeft/></button>
    <button className="carousel-nav next" aria-label="Next offer" onClick={() => setIndex((index + 1) % pages)}><ChevronRight/></button>
    <div className="dots">{banners.map((b, i) => <button key={b.sku} aria-label={'Show offer ' + (i + 1)} className={i === index ? 'on' : ''} onClick={() => setIndex(i)}/>)}</div>
  </section>;
}

export default function Home() {
  const { products, recent, me } = useStore();
  const byCategory = category => products.filter(p => p.category === category);
  const deals = products.filter(p => savings(p) >= 40).slice(0, 8);
  const mobiles = byCategory('Mobiles').concat(byCategory('Electronics')).slice(0, 6);
  const home = products.filter(p => ['Home', 'Furniture', 'Appliances'].includes(p.category)).slice(0, 6);
  const lookingFor = (recent.length ? recent : [...products].sort((a, b) => b.reviewCount - a.reviewCount)).slice(0, 8);
  const topPicks = useMemo(() => Object.keys(categoryIcons).filter(c => c !== 'For You')
    .map(category => products.filter(p => p.category === category).sort((a, b) => savings(b) - savings(a))[0]).filter(Boolean), [products]);
  const name = me?.loggedIn && me.name ? me.name.split(' ')[0] : '';
  return <div className="home">
    <Carousel products={products}/>
    {lookingFor.length > 0 && <section className="looking-band">
      <h2>{recent.length ? (name ? name + ', still looking for these?' : 'Still looking for these?') : 'Suggested for you'}</h2>
      <div className="tile-row">{lookingFor.map(product => <Tile key={product._id} product={product} caption={money(product.price)}/>)}</div>
    </section>}
    <section className="shelf shop-by-category">
      <SectionHeading title="Shop by category" subtitle="Top picks from every department"/>
      <div className="category-grid">{topPicks.map(product => <button key={product.category} className="category-card" onClick={() => navigate('shop?category=' + encodeURIComponent(product.category))}>
        <img src={imageUrl(product.image, 200)} alt=""/><strong>{product.category}</strong><span>Up to {savings(product)}% off</span>
      </button>)}</div>
    </section>
    {Shelf({ title: 'Best deals for you', subtitle: 'Min. 40% off · Limited-time picks', items: deals, target: 'shop?sort=discount', eyebrow: 'DEALS OF THE DAY' })}
    <section className="ad-strip">
      {[['Bank offer', '10% instant discount with demo cards', 'offers', 'violet'], ['SuperCoins', 'Earn coins on every order', 'account/coins', 'sunset'],
        ['FaultKart Plus', 'Double coins & early access', 'account/plus', 'night'], ['Gift cards', 'Redeem WELCOME250 for ₹250', 'account/giftcards', 'mint']]
        .map(([title, copy, to, tone]) => <a key={title} className={'ad-card banner-' + tone} href={'/api/ads/click?id=' + encodeURIComponent(title) + '&to=' + encodeURIComponent('/#/' + to)}><span className="ad-tag">AD</span><strong>{title}</strong><span>{copy}</span></a>)}
    </section>
    {Shelf({ title: 'Top mobiles & gadgets', subtitle: 'Latest launches at the best prices', items: mobiles, target: 'shop?category=Mobiles', eyebrow: 'TECH' })}
    {Shelf({ title: 'Home & furniture makeover', subtitle: 'Small upgrades, big difference', items: home, target: 'shop?category=Furniture', eyebrow: 'HOME & LIVING' })}
    {Shelf({ title: 'Fashion top deals', items: byCategory('Fashion').concat(byCategory('Accessories')).slice(0, 8), target: 'shop?category=Fashion', tiles: true })}
    {Shelf({ title: 'Grocery essentials', items: byCategory('Grocery').slice(0, 8), target: 'minutes', tiles: true })}
    <section className="benefits">
      <div><Truck size={24}/><span><strong>Free delivery</strong><small>On every demo order</small></span></div>
      <div><ShieldCheck size={24}/><span><strong>Safe demo checkout</strong><small>No real transactions</small></span></div>
      <div><RotateCcw size={24}/><span><strong>Easy cancellation</strong><small>Before out-for-delivery</small></span></div>
      <div><Headset size={24}/><span><strong>24x7 help centre</strong><small>Raise a demo ticket</small></span></div>
    </section>
  </div>;
}
