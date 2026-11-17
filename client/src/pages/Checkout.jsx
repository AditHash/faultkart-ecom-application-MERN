import React, { useEffect, useState } from 'react';
import { AlertCircle, Info, CheckCircle2, Wallet, CreditCard, Landmark, QrCode, Gift, Plus } from 'lucide-react';
import { api, money, navigate, useStore } from '../lib.js';
import { Empty, AddressFields, blankAddress, addressValid, ProductImage } from '../components.jsx';
import { PriceDetails } from './Cart.jsx';

const payments = [
  ['upi', QrCode, 'UPI', 'Pay with any UPI app (simulated, nothing is charged)'],
  ['card', CreditCard, 'Credit / Debit / ATM Card', 'Simulated — card details are never collected in this demo'],
  ['netbanking', Landmark, 'Net Banking', 'Simulated bank redirect, no real transaction'],
  ['wallet', Gift, 'Gift Card Balance', 'Use your FaultKart gift card balance'],
  ['cod', Wallet, 'Cash on Delivery', 'Simulated order, no payment collected']
];

export default function Checkout() {
  const { cart, count, me, busy, setBusy, coupon, clearCoupon, reloadAll, refreshMe, notify } = useStore();
  const addresses = me?.addresses || [];
  const [selected, setSelected] = useState('');
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(blankAddress);
  const [saveAddress, setSaveAddress] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!selected && addresses.length) setSelected((addresses.find(a => a.isDefault) || addresses[0])._id);
    if (!addresses.length) setAdding(true);
  }, [addresses.length]);

  async function placeOrder(event) {
    event.preventDefault();
    if (busy) return;
    setFormError('');
    let address = addresses.find(a => a._id === selected);
    if (adding || !address) {
      if (!addressValid(draft)) {
        setFormError('Please enter your name, complete address, 10-digit mobile number and 6-digit PIN code.');
        return;
      }
      address = draft;
    }
    if (paymentMethod === 'wallet' && (me?.giftCardBalance || 0) < cart.total) {
      setFormError('Your gift card balance (' + money(me?.giftCardBalance) + ') is not enough. Choose another payment option.');
      return;
    }
    setBusy(true);
    try {
      const delivery = { fullName: address.fullName, phone: address.phone, address: address.address + (address.locality ? ', ' + address.locality : ''),
        city: address.city, state: address.state, pincode: address.pincode };
      if (adding && saveAddress && me?.loggedIn) await api('/me/addresses', { method: 'POST', body: JSON.stringify(draft) }).catch(() => {});
      const order = await api('/orders', { method: 'POST', body: JSON.stringify({ delivery, paymentMethod, coupon }) });
      clearCoupon();
      navigate('success/' + order.orderId);
      try { await reloadAll(''); await refreshMe(); }
      catch { notify('Your demo order was placed. Reload to update your cart and order history.'); }
    } catch (error) { setFormError(error.message); }
    finally { setBusy(false); }
  }

  return <div className="inner-page">
    <h1 className="page-title">Secure demo checkout</h1>
    {!count ? <Empty title="Nothing to check out yet" description="Add items to your cart to continue." action={() => navigate('shop')}/> :
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={placeOrder} noValidate>
          <section className="step done"><div className="step-head"><span>1</span><h3>LOGIN</h3>{me?.loggedIn && <CheckCircle2 size={16}/>}</div>
            {me?.loggedIn ? <p className="step-body"><strong>{me.name}</strong> +91 {me.phone}</p>
              : <p className="step-body">Checking out as guest. <button type="button" className="text-link" onClick={() => navigate('login?next=checkout')}>Login</button> to save addresses and earn SuperCoins.</p>}
          </section>
          <section className="step"><div className="step-head"><span>2</span><h3>DELIVERY ADDRESS</h3></div>
            <div className="step-body">
              {addresses.map(a => <label key={a._id} className={'address-option' + (!adding && selected === a._id ? ' selected' : '')}>
                <input type="radio" name="saved-address" checked={!adding && selected === a._id} onChange={() => { setSelected(a._id); setAdding(false); }}/>
                <span><strong>{a.fullName}</strong> <em className="tag">{a.label}</em> {a.phone}<br/>{a.address}{a.locality ? ', ' + a.locality : ''}, {a.city}, {a.state} - <strong>{a.pincode}</strong></span>
              </label>)}
              {addresses.length > 0 && !adding && <button type="button" className="add-new" onClick={() => setAdding(true)}><Plus size={16}/> Add a new address</button>}
              {adding && <div className="new-address">
                <AddressFields value={draft} onChange={setDraft} idPrefix="checkout"/>
                {me?.loggedIn && <label className="check"><input type="checkbox" checked={saveAddress} onChange={e => setSaveAddress(e.target.checked)}/> Save this address to my account</label>}
                {addresses.length > 0 && <button type="button" className="text-link" onClick={() => setAdding(false)}>Cancel</button>}
              </div>}
            </div>
          </section>
          <section className="step"><div className="step-head"><span>3</span><h3>ORDER SUMMARY</h3></div>
            <div className="step-body checkout-mini-items">{cart.items.map(item => <div key={item.productId}>
              <ProductImage product={item} className="mini-thumb" width={200}/><span>{item.name} × {item.quantity}</span><strong>{money(item.price * item.quantity)}</strong></div>)}</div>
          </section>
          <section className="step"><div className="step-head"><span>4</span><h3>PAYMENT OPTIONS</h3></div>
            <div className="step-body payment-options">{payments.map(([value, Icon, title, hint]) => <label key={value} className={paymentMethod === value ? 'selected' : ''}>
              <input type="radio" name="payment" value={value} checked={paymentMethod === value} onChange={() => setPaymentMethod(value)}/><Icon size={22}/>
              <span><strong>{title}{value === 'wallet' ? ' (' + money(me?.giftCardBalance) + ')' : ''}</strong><small>{hint}</small></span></label>)}</div>
          </section>
          {formError && <p className="form-error" role="alert"><AlertCircle size={17}/>{formError}</p>}
          <button type="submit" className="btn btn-orange full large" disabled={busy}>{busy ? 'Placing demo order...' : 'PLACE DEMO ORDER'}</button>
          <p className="secure-note"><Info size={15}/> This is a training store. Do not enter real personal information.</p>
        </form>
        <aside className="summary-column"><PriceDetails/></aside>
      </div>}
  </div>;
}
