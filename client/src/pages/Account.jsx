import React, { useEffect, useState } from 'react';
import {
  CircleUserRound, MapPin, Package, Ticket, Coins, Crown, CreditCard, Gift, Bell, Heart, LogOut, Copy, Pencil, Trash2, Plus, ChevronRight, Lock
} from 'lucide-react';
import { api, money, navigate, useStore, formatDate } from '../lib.js';
import { Empty, AddressFields, blankAddress, addressValid } from '../components.jsx';

const sections = [
  ['MY ORDERS', [['My Orders', 'orders', Package]]],
  ['ACCOUNT SETTINGS', [['Profile Information', 'account', CircleUserRound], ['Manage Addresses', 'account/addresses', MapPin]]],
  ['PAYMENTS', [['Gift Cards', 'account/giftcards', Gift], ['Saved Cards & Wallet', 'account/payments', CreditCard]]],
  ['MY STUFF', [['My Coupons', 'account/coupons', Ticket], ['SuperCoins', 'account/coins', Coins], ['Plus Zone', 'account/plus', Crown],
    ['All Notifications', 'account/notifications', Bell], ['My Wishlist', 'wishlist', Heart]]]
];

function Profile() {
  const { me, act } = useStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: me.name, email: me.email, gender: me.gender });
  useEffect(() => setForm({ name: me.name, email: me.email, gender: me.gender }), [me.name, me.email, me.gender]);
  async function save(event) {
    event.preventDefault();
    if (await act(() => api('/me', { method: 'PATCH', body: JSON.stringify(form) }), 'Profile updated')) setEditing(false);
  }
  return <form className="panel" onSubmit={save}>
    <div className="panel-head"><h2>Personal Information</h2><button type="button" className="text-link" onClick={() => setEditing(!editing)}>{editing ? 'Cancel' : 'Edit'}</button></div>
    <div className="form-grid">
      <label>Your name <input disabled={!editing} maxLength={60} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/></label>
      <label>Email Address <input disabled={!editing} type="email" maxLength={120} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}/></label>
      <fieldset className="wide address-type"><legend>Your Gender</legend>{[['male', 'Male'], ['female', 'Female'], ['other', 'Other']].map(([value, label]) =>
        <label key={value} className="inline-radio"><input type="radio" disabled={!editing} name="gender" checked={form.gender === value} onChange={() => setForm({ ...form, gender: value })}/>{label}</label>)}</fieldset>
      <label>Mobile Number <input disabled value={'+91 ' + me.phone}/></label>
    </div>
    {editing && <button className="btn btn-primary">SAVE</button>}
    <div className="faq-mini"><h3>FAQs</h3><p><strong>What happens when I update my email address?</strong><br/>Your demo login stays the same; only the contact email changes.</p>
      <p><strong>Is my data real?</strong><br/>No. FaultKart stores demo profiles per browser session only — never use real personal details.</p></div>
  </form>;
}

function Addresses() {
  const { me, act } = useStore();
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(blankAddress);
  const [error, setError] = useState('');
  function open(address) { setEditing(address ? address._id : 'new'); setDraft(address ? { ...blankAddress, ...address } : blankAddress); setError(''); }
  async function save(event) {
    event.preventDefault();
    if (!addressValid(draft)) { setError('Please enter a name, complete address, 10-digit mobile number and 6-digit PIN code.'); return; }
    const ok = await act(() => editing === 'new' ? api('/me/addresses', { method: 'POST', body: JSON.stringify(draft) })
      : api('/me/addresses/' + editing, { method: 'PUT', body: JSON.stringify(draft) }), 'Address saved');
    if (ok) setEditing(null);
  }
  return <div className="panel">
    <div className="panel-head"><h2>Manage Addresses</h2></div>
    {editing ? <form onSubmit={save} className="address-editor"><h3>{editing === 'new' ? 'ADD A NEW ADDRESS' : 'EDIT ADDRESS'}</h3>
      <AddressFields value={draft} onChange={setDraft} idPrefix="account"/>
      <label className="check"><input type="checkbox" checked={!!draft.isDefault} onChange={e => setDraft({ ...draft, isDefault: e.target.checked })}/> Make this my default address</label>
      {error && <p className="form-error">{error}</p>}
      <div className="row-actions"><button className="btn btn-orange">SAVE</button><button type="button" className="text-link" onClick={() => setEditing(null)}>CANCEL</button></div>
    </form> : <button className="add-new" onClick={() => open(null)}><Plus size={16}/> ADD A NEW ADDRESS</button>}
    {me.addresses.map(a => <div key={a._id} className="address-card">
      <div><em className="tag">{a.label}</em>{a.isDefault && <em className="tag default">Default</em>}<p><strong>{a.fullName}</strong> {a.phone}</p><p>{a.address}{a.locality ? ', ' + a.locality : ''}, {a.city}, {a.state} - <strong>{a.pincode}</strong></p></div>
      <div className="row-actions"><button aria-label={'Edit address of ' + a.fullName} onClick={() => open(a)}><Pencil size={15}/></button>
        <button aria-label={'Delete address of ' + a.fullName} onClick={() => act(() => api('/me/addresses/' + a._id, { method: 'DELETE' }), 'Address deleted')}><Trash2 size={15}/></button></div>
    </div>)}
    {!me.addresses.length && !editing && <p className="muted">No saved addresses yet.</p>}
  </div>;
}

function Coupons() {
  const { notify } = useStore();
  const [coupons, setCoupons] = useState([]);
  useEffect(() => { api('/coupons').then(setCoupons).catch(() => {}); }, []);
  return <div className="panel"><div className="panel-head"><h2>Available Coupons</h2></div>
    {coupons.map(c => <div key={c.code} className="coupon-card"><div><strong className="green">{c.title}</strong><p>{c.description}</p><small>Valid till {formatDate(c.validTill)}</small></div>
      <button className="code" onClick={() => { navigator.clipboard?.writeText(c.code).catch(() => {}); notify('Copied ' + c.code + ' — apply it in your cart'); }}><Copy size={14}/> {c.code}</button></div>)}
  </div>;
}

function SuperCoins() {
  const { me, act } = useStore();
  const [data, setData] = useState(null);
  const load = () => api('/me/coins').then(setData).catch(() => {});
  useEffect(() => { load(); }, [me.supercoins]);
  if (!data) return null;
  return <div className="panel">
    <div className="coin-hero"><Coins size={42}/><div><span>SuperCoin Balance</span><strong>{data.balance}</strong></div></div>
    <div className="reward-card"><div><strong>Convert {data.redeem.coins} SuperCoins into {money(data.redeem.value)} gift card balance</strong><p className="muted">Use gift card balance at checkout.</p></div>
      <button className="btn btn-orange" disabled={data.balance < data.redeem.coins} onClick={() => act(() => api('/me/coins/redeem', { method: 'POST' }), 'SuperCoins redeemed')}>Redeem</button></div>
    <h3>Activity</h3>
    <ul className="history">{data.history.map((h, i) => <li key={i}><span>{h.reason}<small>{formatDate(h.createdAt)}</small></span><strong className={h.delta >= 0 ? 'green' : 'red'}>{h.delta >= 0 ? '+' : ''}{h.delta}</strong></li>)}</ul>
  </div>;
}

function Plus_() {
  const { me, act } = useStore();
  const target = 200;
  const pct = Math.min(100, Math.round(me.supercoins / target * 100));
  return <div className="panel plus-zone">
    <div className="plus-hero"><Crown size={44}/><div><h2>FaultKart Plus</h2><p>{me.plusMember ? 'You are a Plus member. Enjoy double SuperCoins!' : 'Collect ' + target + ' SuperCoins to unlock Plus.'}</p></div></div>
    {!me.plusMember && <><div className="progress"><i style={{ width: pct + '%' }}/></div><p className="muted">{me.supercoins} / {target} SuperCoins</p>
      <button className="btn btn-orange" onClick={() => act(() => api('/me/plus/join', { method: 'POST' }), 'Welcome to FaultKart Plus!')}>Join Plus</button></>}
    <div className="benefit-grid">{[['Double SuperCoins', 'Earn 4 coins per ₹100 (max 200/order)'], ['Early access', 'Shop sales before everyone else (demo)'],
      ['Free delivery', 'On every demo order'], ['Priority support', 'Faster responses in the help centre']].map(([t, c]) => <div key={t}><strong>{t}</strong><p>{c}</p></div>)}</div>
  </div>;
}

function GiftCards() {
  const { me, act } = useStore();
  const [code, setCode] = useState('');
  async function redeem(event) {
    event.preventDefault();
    if (await act(() => api('/me/giftcards/redeem', { method: 'POST', body: JSON.stringify({ code }) }), 'Gift card added to your balance')) setCode('');
  }
  return <div className="panel">
    <div className="panel-head"><h2>Gift Cards</h2></div>
    <div className="coin-hero"><Gift size={40}/><div><span>Gift card balance</span><strong>{money(me.giftCardBalance)}</strong></div></div>
    <form className="inline-form" onSubmit={redeem}><input aria-label="Gift card code" placeholder="Enter gift card code" value={code} maxLength={20} onChange={e => setCode(e.target.value)}/><button className="btn btn-primary">Add gift card</button></form>
    <p className="muted">Demo codes: <code>WELCOME250</code>, <code>FKGIFT500</code>, <code>FKGIFT1000</code>. Each code can be added once.</p>
  </div>;
}

function Payments() {
  const { me } = useStore();
  return <div className="panel"><div className="panel-head"><h2>Saved Cards & Wallet</h2></div>
    <div className="wallet-row"><Gift size={22}/><div><strong>FaultKart Gift Card balance</strong><p className="muted">Usable at checkout via “Gift Card Balance”.</p></div><strong>{money(me.giftCardBalance)}</strong></div>
    <div className="wallet-row"><Coins size={22}/><div><strong>SuperCoins</strong><p className="muted">Redeem 100 coins for ₹50 balance.</p></div><strong>{me.supercoins}</strong></div>
    <div className="wallet-row"><Lock size={22}/><div><strong>Saved cards & UPI</strong><p className="muted">This demo never collects or stores card numbers, CVV or UPI PINs. Payment options at checkout are simulated.</p></div><strong>0</strong></div>
  </div>;
}

function Preferences() {
  const { me, refreshMe, notify } = useStore();
  const prefs = me.preferences || {};
  async function toggle(channel, topic) {
    try {
      await api('/me/preferences', { method: 'PATCH', body: JSON.stringify({ [channel]: { [topic]: !prefs[channel]?.[topic] } }) });
      await refreshMe(); notify('Notification preferences saved');
    } catch (error) { notify(error.message); }
  }
  return <div className="prefs"><h3>Notification preferences</h3>
    <table><thead><tr><th/><th>Order updates</th><th>Offers & deals</th></tr></thead><tbody>
      {[['email', 'Email'], ['sms', 'SMS'], ['push', 'Push']].map(([channel, label]) => <tr key={channel}><th>{label}</th>
        {['orders', 'offers'].map(topic => <td key={topic}><input type="checkbox" aria-label={label + ' ' + topic} checked={!!prefs[channel]?.[topic]} onChange={() => toggle(channel, topic)}/></td>)}</tr>)}
    </tbody></table></div>;
}

function Notifications() {
  const { refreshMe } = useStore();
  const [items, setItems] = useState(null);
  useEffect(() => {
    api('/me/notifications').then(list => { setItems(list); return api('/me/notifications/read', { method: 'POST' }); }).then(refreshMe).catch(() => setItems([]));
  }, []);
  if (!items) return null;
  return <div className="panel"><div className="panel-head"><h2>All Notifications</h2></div>
    <Preferences/>
    {items.length ? items.map(n => <button key={n._id} className={'notification' + (n.read ? '' : ' unread')} onClick={() => n.link && navigate(n.link)}>
      <Bell size={18}/><span><strong>{n.title}</strong><p>{n.body}</p><small>{formatDate(n.createdAt, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</small></span>{n.link && <ChevronRight size={16}/>}</button>)
      : <p className="muted">No notifications yet.</p>}
  </div>;
}

const views = { '': Profile, addresses: Addresses, coupons: Coupons, coins: SuperCoins, plus: Plus_, giftcards: GiftCards, payments: Payments, notifications: Notifications };

export default function Account() {
  const { me, route, logout } = useStore();
  if (!me) return <div className="loading-block">Loading account…</div>;
  if (!me.loggedIn) return <Empty icon={CircleUserRound} title="Please log in" description="Log in to manage your profile, addresses, coins and gift cards." action={() => navigate('login?next=' + encodeURIComponent('account' + (route.id ? '/' + route.id : '')))} actionLabel="Login"/>;
  const View = views[route.id] || Profile;
  const current = 'account' + (route.id ? '/' + route.id : '');
  return <div className="inner-page account-layout">
    <aside className="account-nav">
      <div className="hello"><CircleUserRound size={44}/><div><small>Hello,</small><strong>{me.name}</strong></div></div>
      <nav aria-label="Account">{sections.map(([title, links]) => <div key={title} className="account-section"><h4>{title}</h4>
        {links.map(([label, to, Icon]) => <button key={to} className={current === to ? 'active' : ''} onClick={() => navigate(to)}><Icon size={17}/>{label}{to === 'account/notifications' && me.unread > 0 && <b className="count-pill">{me.unread}</b>}</button>)}</div>)}
        <button className="logout" onClick={logout}><LogOut size={17}/> Logout</button></nav>
    </aside>
    <section className="account-main"><View/></section>
  </div>;
}
