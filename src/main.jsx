import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { ArrowUpRight, Check, ChevronDown, Droplets, Menu, ShieldCheck, Sparkles, Star, Truck, X } from 'lucide-react';
import './styles.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const services = [
  { n:'01', title:'Interior Detailing', text:'A thorough refresh for the places you spend the most time.', tags:['Vacuum & crevice cleaning','Interior surface cleaning','Glass & door jambs'] },
  { n:'02', title:'Exterior Detailing', text:'Bring back a clean finish and a sharper first impression.', tags:['Hand wash','Wheels & tires','Exterior finish touch-up'] },
  { n:'03', title:'Full Detail', text:'Inside and out, with attention paid to the details that matter.', tags:['Interior + exterior','Vehicle-specific quote','Add-ons available'] },
];
const initialForm = { name:'', phone:'', email:'', vehicle:'', service:'Full Detail', location:'', condition:'', notes:'', consent:false, website:'' };

function App() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const update = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };
  async function submit(e) {
    e.preventDefault();
    if (form.website) return; // honeypot spam field
    setStatus('loading'); setMessage('');
    if (!supabase) {
      setStatus('error');
      setMessage('The quote form is not connected yet. Please call or message the business directly while setup is completed.');
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke('submit-quote', {
        body: { ...form, source: window.location.href }
      });
      if (error || !data?.success) throw new Error(data?.error || error?.message || 'Could not submit quote.');
      setStatus('success');
      setMessage('Your request is in! We’ll review the details and get back to you with a quote.');
      setForm(initialForm);
    } catch (err) {
      setStatus('error');
      setMessage('We couldn’t confirm your request was received. Please try again or contact us directly. Your form has not been marked as submitted.');
    }
  }
  return <div>
    <div className="topline"><span>Mobile detailing · Flemingsburg, Kentucky</span><a href="#quote">Request a quote <ArrowUpRight size={14}/></a></div>
    <header className="nav wrap">
      <a className="brand" href="#home" aria-label="Driveline Detailing home"><span className="brand-mark"><Droplets size={23}/></span><span>DRIVELINE<span className="brand-sub">DETAILING</span></span></a>
      <button className="mobile-menu" onClick={()=>setMenuOpen(!menuOpen)} aria-label="Toggle navigation">{menuOpen?<X/>:<Menu/>}</button>
      <nav className={menuOpen?'nav-links open':'nav-links'}><a href="#services" onClick={()=>setMenuOpen(false)}>Services</a><a href="#process" onClick={()=>setMenuOpen(false)}>How it works</a><a href="#about" onClick={()=>setMenuOpen(false)}>Why Driveline</a><a className="nav-cta" href="#quote" onClick={()=>setMenuOpen(false)}>Get a quote <ArrowUpRight size={16}/></a></nav>
    </header>
    <main>
      <section className="hero wrap" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><span className="dot"></span> YOUR VEHICLE. RESET.</div>
          <h1>QUALITY WORK.<br/><em>EVERY</em> DETAIL.</h1>
          <p className="hero-text">A cleaner ride starts with care that goes beyond the surface. Professional mobile detailing serving Flemingsburg and the surrounding area.</p>
          <div className="hero-actions"><a className="button primary" href="#quote">Get my free quote <ArrowUpRight size={18}/></a><a className="text-link" href="#services">Explore services <span>↓</span></a></div>
          <div className="trust-row"><div className="trust-icon"><ShieldCheck size={19}/></div><div><strong>Detail-minded service</strong><span>Careful work. Clear communication.</span></div></div>
        </div>
        <div className="hero-art" role="img" aria-label="Glossy dark vehicle in a detailing studio">
          <div className="hero-image"></div><div className="image-overlay"></div>
          <div className="hero-stamp"><span>DRIVELINE</span><b>DETAILING</b><small>FLEMINGSBURG, KY</small></div>
          <div className="image-caption"><span className="caption-line"></span><span>THE FINISH IS IN THE DETAILS</span></div>
        </div>
        <div className="hero-bottom"><span>01 / PERSONALIZED SERVICE</span><span>BUILT AROUND YOUR VEHICLE</span><span>LOCAL. MOBILE. DETAIL-FOCUSED.</span></div>
      </section>
      <section className="services-section" id="services">
        <div className="wrap">
          <div className="section-heading"><div><div className="eyebrow">WHAT WE DO</div><h2>MAKE EVERY DRIVE<br/>FEEL <em>FRESH.</em></h2></div><p>Every vehicle is different. Tell us what you drive and what it needs, and we’ll put together a quote that fits the job.</p></div>
          <div className="service-grid">{services.map((s,i)=><article className="service-card" key={s.n}><div className="service-top"><span>{s.n} / SERVICE</span>{i===0?<Sparkles/>:i===1?<Droplets/>:<Truck/>}</div><h3>{s.title}</h3><p>{s.text}</p><ul>{s.tags.map(t=><li key={t}><Check size={15}/>{t}</li>)}</ul><a href="#quote" className="card-link">Ask for a quote <ArrowUpRight size={16}/></a></article>)}</div>
          <p className="pricing-note">Pricing depends on vehicle size, condition, and the services requested. We’ll confirm the price with you before any work begins.</p>
        </div>
      </section>
      <section className="process-section wrap" id="process">
        <div className="process-title"><div className="eyebrow">STRAIGHTFORWARD FROM START TO FINISH</div><h2>NO GUESSWORK.<br/><em>JUST GOOD WORK.</em></h2></div>
        <div className="steps"><div className="step"><span>01</span><div><h3>Tell us about your ride</h3><p>Choose your service and share a few details using the quote form.</p></div></div><div className="step"><span>02</span><div><h3>Get a personal quote</h3><p>We review your request and contact you to confirm the details and price.</p></div></div><div className="step"><span>03</span><div><h3>Get your clean back</h3><p>Once you approve the quote, we’ll coordinate a time that works for you.</p></div></div></div>
      </section>
      <section className="about-section" id="about"><div className="wrap about-inner"><div className="about-icon"><Star size={28}/></div><div><div className="eyebrow">LOCAL SERVICE. PERSONAL ATTENTION.</div><h2>THE LITTLE THINGS<br/>MAKE THE <em>DIFFERENCE.</em></h2><p>Driveline Detailing is focused on dependable service and quality work in Flemingsburg, Kentucky. No one-size-fits-all pricing, no surprises — just a clear conversation about what your vehicle needs.</p></div><a href="#quote" className="button light">Let’s talk about your detail <ArrowUpRight size={18}/></a></div></section>
      <section className="quote-section wrap" id="quote">
        <div className="quote-intro"><div className="eyebrow"><span className="dot"></span> START HERE</div><h2>GET YOUR<br/><em>FREE QUOTE.</em></h2><p>Fill this out and we’ll follow up with you directly. This is a quote request, not a confirmed appointment.</p><div className="quote-assurance"><ShieldCheck/><span><strong>Your details stay with us.</strong><small>We use your information to respond to your request.</small></span></div><div className="quote-side-note">DRIVELINE DETAILING<br/>FLEMINGSBURG, KENTUCKY</div></div>
        <form className="quote-form" onSubmit={submit}>
          <div className="form-head"><span>QUOTE REQUEST</span><span className="required-note">* REQUIRED</span></div>
          <div className="field-grid">
            <label>Full name *<input name="name" value={form.name} onChange={update} required autoComplete="name" placeholder="Your name"/></label>
            <label>Phone number *<input name="phone" value={form.phone} onChange={update} required autoComplete="tel" type="tel" placeholder="(555) 555-5555"/></label>
            <label>Email address<input name="email" value={form.email} onChange={update} type="email" autoComplete="email" placeholder="you@example.com"/></label>
            <label>Vehicle *<input name="vehicle" value={form.vehicle} onChange={update} required placeholder="Year, make & model"/></label>
            <label>Service requested *<span className="select-wrap"><select name="service" value={form.service} onChange={update}><option>Full Detail</option><option>Interior Detailing</option><option>Exterior Detailing</option><option>Seat / Carpet Extraction</option><option>Pet Hair Removal</option><option>Other / Not Sure</option></select><ChevronDown size={16}/></span></label>
            <label>Where is the vehicle located? *<input name="location" value={form.location} onChange={update} required placeholder="Town or ZIP code"/></label>
          </div>
          <label>Vehicle condition <span className="select-wrap"><select name="condition" value={form.condition} onChange={update}><option value="">Choose one (optional)</option><option>Light cleaning needed</option><option>Average everyday use</option><option>Heavy dirt or stains</option><option>Pet hair / odor concerns</option><option>Not sure</option></select><ChevronDown size={16}/></span></label>
          <label>Anything else we should know? <textarea name="notes" value={form.notes} onChange={update} rows="4" placeholder="Stains, pet hair, specific areas, or anything you want us to know..."/></label>
          <label className="consent"><input type="checkbox" name="consent" checked={form.consent} onChange={update} required/><span>I agree that Driveline Detailing may contact me about this quote request. *</span></label>
          <input className="hp" name="website" value={form.website} onChange={update} tabIndex="-1" autoComplete="off" aria-hidden="true"/>
          <button className="button primary submit-button" disabled={status==='loading'} type="submit">{status==='loading'?'Sending request…':'Send my quote request'} <ArrowUpRight size={18}/></button>
          {message && <div className={`form-message ${status}`} role="status">{message}</div>}
          <p className="form-foot">No payment required. We’ll review your details and contact you before confirming any work.</p>
        </form>
      </section>
    </main>
    <footer><div className="wrap footer-inner"><a className="brand" href="#home"><span className="brand-mark"><Droplets size={21}/></span><span>DRIVELINE<span className="brand-sub">DETAILING</span></span></a><span>Mobile auto detailing · Flemingsburg, KY</span><a href="#quote">Request a quote <ArrowUpRight size={15}/></a><small>© {new Date().getFullYear()} Driveline Detailing</small></div></footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);
