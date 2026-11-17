import React from 'react';
import { Star, Heart, Plus, ArrowRight, ShoppingBag, ChevronRight, BadgeCheck } from 'lucide-react';
import { money, savings, navigate, imageUrl, useStore } from './lib.js';

export function ProductImage({ product, className = '', width = 400 }) {
  return <div className={'product-photo ' + className} aria-label={product.name}>
    <img src={imageUrl(product.image, width)} alt={product.name} loading="lazy" onError={event => {
      event.currentTarget.style.display = 'none';
      event.currentTarget.parentElement.classList.add('image-fallback');
    }} />
    <span className="photo-fallback-label">{product.name}</span>
  </div>;
}

export function Rating({ product, value }) {
  const rating = Number(value ?? product?.rating ?? 4.4);
  return <span className={'rating' + (rating < 3 ? ' low' : rating < 4 ? ' mid' : '')}>{rating.toFixed(1)}<Star size={11} fill="currentColor" strokeWidth={1.5}/></span>;
}

export function Assured() {
  return <span className="assured"><BadgeCheck size={13}/> Assured</span>;
}

export function Breadcrumbs({ items }) {
  return <div className="breadcrumbs">
    <button onClick={() => navigate('')}>Home</button>
    {items.map((item, index) => <React.Fragment key={index}><ChevronRight size={13}/>
      {item.to !== undefined ? <button onClick={() => navigate(item.to)}>{item.label}</button> : <span>{item.label}</span>}</React.Fragment>)}
  </div>;
}

export function SectionHeading({ eyebrow, title, subtitle, onMore }) {
  return <div className="section-heading">
    <div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>
    {onMore && <button className="round-more" aria-label={'View all ' + title} onClick={onMore}><ArrowRight size={18}/></button>}
  </div>;
}

export function Empty({ icon: Icon = ShoppingBag, title, description, action, actionLabel = 'Shop now' }) {
  return <div className="empty-state"><div className="empty-icon"><Icon size={40}/></div><h2>{title}</h2><p>{description}</p>
    {action && <button className="btn btn-primary" onClick={action}>{actionLabel} <ArrowRight size={16}/></button>}</div>;
}

export function ProductCard({ product }) {
  const { wishSet, busy, toggleWish, addToCart } = useStore();
  const isSaved = wishSet.has(product._id);
  return <article className="product-card">
    <button className="wishlist-icon" aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'} title="Wishlist" onClick={() => toggleWish(product)} disabled={busy}>
      <Heart size={17} fill={isSaved ? 'currentColor' : 'none'}/></button>
    {product.badge && <span className="card-badge">{product.badge}</span>}
    <button className="product-cover-button" onClick={() => navigate('product/' + product._id)}>
      <ProductImage product={product} className="card-photo"/>
    </button>
    <div className="card-content">
      <span className="card-brand">{product.brand}</span>
      <button className="product-title" onClick={() => navigate('product/' + product._id)}>{product.name}</button>
      <div className="review-row"><Rating product={product}/><span>({Number(product.reviewCount || 0).toLocaleString('en-IN')})</span>{product.rating >= 4.4 && <Assured/>}</div>
      <div className="pricing"><strong>{money(product.price)}</strong><del>{money(product.mrp || product.price)}</del><b>{savings(product)}% off</b></div>
      <div className="free-delivery">Free delivery</div>
      <button className="mini-add" disabled={busy || product.stock <= 0} onClick={() => addToCart(product)}>
        <Plus size={15}/> {product.stock <= 0 ? 'Out of stock' : 'Add to cart'}
      </button>
    </div>
  </article>;
}

export function Tile({ product, caption }) {
  return <button className="tile-card" onClick={() => navigate('product/' + product._id)}>
    <ProductImage product={product} className="tile-photo"/>
    <span className="tile-name">{product.name}</span>
    <strong className="tile-caption">{caption || (savings(product) >= 30 ? 'Min. ' + savings(product) + '% Off' : 'From ' + money(product.price))}</strong>
  </button>;
}

export function Shelf({ title, subtitle, items, target, eyebrow, tiles = false }) {
  return <section className="shelf">
    <SectionHeading title={title} subtitle={subtitle} eyebrow={eyebrow} onMore={target !== undefined ? () => navigate(target) : undefined}/>
    {items.length ? <div className={tiles ? 'tile-row' : 'product-grid'}>
      {items.map(product => tiles ? <Tile key={product._id} product={product}/> : <ProductCard key={product._id} product={product}/>)}</div>
      : <div className="loading-grid">{Array.from({ length: 5 }, (_, index) => <div className="skeleton-card" key={index}/>)}</div>}
  </section>;
}

export function Modal({ title, onClose, children }) {
  return <div className="modal-backdrop" onClick={onClose}>
    <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={event => event.stopPropagation()}>
      <div className="modal-head"><h3>{title}</h3><button aria-label="Close dialog" onClick={onClose}>×</button></div>
      {children}
    </div>
  </div>;
}

export function AddressFields({ value, onChange, idPrefix = 'addr' }) {
  const set = key => event => onChange({ ...value, [key]: event.target.value });
  return <div className="form-grid">
    <label>Full name <input required value={value.fullName} maxLength={100} onChange={set('fullName')} placeholder="Your full name"/></label>
    <label>Mobile number <input required type="tel" inputMode="numeric" maxLength={10} value={value.phone} onChange={set('phone')} placeholder="10-digit mobile number"/></label>
    <label>PIN code <input required inputMode="numeric" maxLength={6} value={value.pincode} onChange={set('pincode')} placeholder="6-digit PIN code"/></label>
    <label>Locality <input maxLength={100} value={value.locality || ''} onChange={set('locality')} placeholder="Locality / landmark"/></label>
    <label className="wide">Address <textarea required rows={3} maxLength={200} value={value.address} onChange={set('address')} placeholder="House, street, apartment or area"/></label>
    <label>City <input required maxLength={100} value={value.city} onChange={set('city')} placeholder="City / district / town"/></label>
    <label>State <input required maxLength={100} value={value.state} onChange={set('state')} placeholder="State"/></label>
    <fieldset className="wide address-type"><legend>Address type</legend>
      {['Home', 'Work', 'Other'].map(label => <label key={label} className="inline-radio"><input type="radio" name={idPrefix + '-label'} checked={(value.label || 'Home') === label} onChange={() => onChange({ ...value, label })}/>{label}</label>)}
    </fieldset>
  </div>;
}
export const blankAddress = { fullName: '', phone: '', address: '', locality: '', city: '', state: '', pincode: '', label: 'Home' };
export const addressValid = a => a.fullName.trim() && /^\d{10}$/.test(a.phone) && a.address.trim() && a.city.trim() && a.state.trim() && /^\d{6}$/.test(a.pincode);
