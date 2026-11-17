import React from 'react';
import { ShoppingCart, ShieldCheck, Trash2, Bookmark, Tag, MapPin } from 'lucide-react';
import { money, savings, navigate, useStore, savedPincode, formatDate } from '../lib.js';
import { Empty, ProductImage, Rating } from '../components.jsx';

export function PriceDetails({ showButton = false }) {
  const { cart, count, busy } = useStore();
  const cartSavings = cart.items.reduce((sum, item) => sum + Math.max(0, (item.mrp || item.price) - item.price) * item.quantity, 0);
  return <div className="price-box">
    <div className="price-box-title">PRICE DETAILS</div>
    <div className="price-line"><span>Price ({count} item{count === 1 ? '' : 's'})</span><span>{money(cart.subtotal + cartSavings)}</span></div>
    <div className="price-line"><span>Discount</span><span className="green">−{money(cartSavings)}</span></div>
    <div className="price-line"><span>Coupons for you</span><span className="green">−{money(cart.discount)}</span></div>
    <div className="price-line"><span>Delivery Charges</span><span><del className="muted">₹40</del> <span className="green">FREE</span></span></div>
    <div className="price-total"><strong>Total Amount</strong><strong>{money(cart.total)}</strong></div>
    <div className="you-save">You will save {money(cartSavings + cart.discount)} on this order</div>
    {showButton && <button className="btn btn-orange full" disabled={!count || busy} onClick={() => navigate('checkout')}>Place order</button>}
    <p className="secure-note"><ShieldCheck size={20}/> Safe and secure payments. Easy returns. 100% Authentic products. (Simulated checkout)</p>
  </div>;
}

export default function Cart() {
  const { cart, count, busy, saved, setQuantity, removeCart, saveForLater, moveToCart, removeSaved, couponDraft, setCouponDraft, applyCoupon, coupon } = useStore();
  const pincode = savedPincode();
  const deliveryBy = formatDate(Date.now() + 4 * 864e5, { weekday: 'short', day: 'numeric', month: 'short' });
  return <div className="inner-page cart-page">
    {count ? <div className="checkout-layout">
      <div>
        <section className="cart-panel">
          <div className="cart-tabs"><h1>Your shopping cart ({count})</h1></div>
          <div className="deliver-to"><span><MapPin size={15}/> Deliver to: <strong>{pincode || 'Select pincode'}</strong></span><button className="btn btn-outline small" onClick={() => navigate('checkout')}>Change</button></div>
          {cart.items.map(item => <div className="cart-item" key={item.productId}>
            <div className="cart-media">
              <button className="plain" onClick={() => navigate('product/' + item.productId)}><ProductImage product={item} className="cart-image" width={200}/></button>
              <label className="qty-select">Qty: <select aria-label={'Quantity for ' + item.name} value={item.quantity} disabled={busy}
                onChange={e => setQuantity(item, Number(e.target.value))}>
                {Array.from({ length: Math.max(item.quantity, 10) }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
              </select></label>
            </div>
            <div className="cart-item-content">
              <button className="plain cart-name" onClick={() => navigate('product/' + item.productId)}>{item.name}</button>
              <p className="muted">Seller: FaultKart Retail · {item.sku}</p>
              <div className="pricing"><b className="green">↓{savings(item)}%</b><del>{money(item.mrp || item.price)}</del><strong>{money(item.price)}</strong></div>
              {item.stock <= 5 && <p className="hurry">Only {item.stock} left</p>}
              <p className="small-text">Delivery by {deliveryBy} | <span className="green">Free</span></p>
            </div>
            <div className="cart-item-actions">
              <button disabled={busy} onClick={() => saveForLater(item)}><Bookmark size={16}/> Save for later</button>
              <button disabled={busy} onClick={() => removeCart(item)}><Trash2 size={16}/> Remove</button>
            </div>
          </div>)}
          <div className="cart-footer"><button className="btn btn-orange" disabled={busy} onClick={() => navigate('checkout')}>Place order</button></div>
        </section>
        {saved.length > 0 && <section className="cart-panel saved-panel"><h2>Saved For Later ({saved.length})</h2>
          {saved.map(product => <div className="cart-item" key={product._id}>
            <div className="cart-media"><ProductImage product={product} className="cart-image" width={200}/></div>
            <div className="cart-item-content"><strong>{product.name}</strong><Rating product={product}/>
              <div className="pricing"><strong>{money(product.price)}</strong><del>{money(product.mrp)}</del><b className="green">{savings(product)}% off</b></div></div>
            <div className="cart-item-actions">
              <button disabled={busy} onClick={() => moveToCart(product)}><ShoppingCart size={16}/> Move to cart</button>
              <button disabled={busy} onClick={() => removeSaved(product)}><Trash2 size={16}/> Remove</button>
            </div>
          </div>)}
        </section>}
      </div>
      <aside className="summary-column">
        <div className="coupon-box"><h3><Tag size={17}/> Apply coupon</h3><form onSubmit={applyCoupon}><input aria-label="Coupon code" placeholder="Enter coupon code" value={couponDraft} onChange={event => setCouponDraft(event.target.value)}/><button type="submit" disabled={busy}>Apply</button></form>
          <p>{coupon ? 'Applied: ' + coupon : 'Try SAVE10 or FLAT100 (demo only)'}</p></div>
        <PriceDetails/>
      </aside>
    </div> : <>
      <Empty icon={ShoppingCart} title="Your cart is empty!" description="Add items to it now." action={() => navigate('shop')}/>
      {saved.length > 0 && <section className="cart-panel saved-panel"><h2>Saved For Later ({saved.length})</h2>
        {saved.map(product => <div className="cart-item" key={product._id}>
          <div className="cart-media"><ProductImage product={product} className="cart-image" width={200}/></div>
          <div className="cart-item-content"><strong>{product.name}</strong><div className="pricing"><strong>{money(product.price)}</strong></div></div>
          <div className="cart-item-actions"><button disabled={busy} onClick={() => moveToCart(product)}><ShoppingCart size={16}/> Move to cart</button>
            <button disabled={busy} onClick={() => removeSaved(product)}><Trash2 size={16}/> Remove</button></div>
        </div>)}
      </section>}
    </>}
  </div>;
}
