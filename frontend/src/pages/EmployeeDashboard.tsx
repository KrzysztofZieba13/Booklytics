import React, { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import Button from '../components/Button';
import API_URL from '../config';

interface Booking {
  _id: string;
  status: 'confirmed' | 'completed';
  startTime: string;
  endTime: string;
  paymentMethod: 'card' | 'blik' | 'on_site' | null;
  paymentStatus: 'pending' | 'paid';
  serviceId: { name: string; duration: number; price: number };
  clientId: { firstName: string; lastName: string; email: string; phoneNumber?: string };
}

interface Service {
  _id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
}

interface Business {
  _id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  openingHours: { open: string; close: string };
}

const CATEGORIES = ['beauty', 'automotive', 'health', 'sport', 'other'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}
function isToday(iso: string) {
  const d = new Date(iso), now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
}

// ── Business card with inline service & hours management ─────────────────────

function BusinessPanel({ business, token, onUpdate }: {
  business: Business;
  token: () => Promise<string | null>;
  onUpdate: (b: Business) => void;
}) {
  const [services, setServices] = useState<Service[]>([]);
  const [expanded, setExpanded] = useState(false);

  const [showServiceForm, setShowServiceForm] = useState(false);
  const [sForm, setSForm] = useState({ name: '', description: '', price: '', duration: 30 });
  const [sError, setSError] = useState('');

  const [hForm, setHForm] = useState({ open: business.openingHours.open, close: business.openingHours.close });
  const [hSaved, setHSaved] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    fetch(`${API_URL}/api/services/business/${business._id}`)
      .then((r) => r.json())
      .then(setServices);
  }, [expanded, business._id]);

  const addService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSError('');
    const t = await token();
    const res = await fetch('${API_URL}/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({ businessId: business._id, ...sForm, price: Number(sForm.price) }),
    });
    const data = await res.json();
    if (res.ok) {
      setServices((prev) => [...prev, data]);
      setShowServiceForm(false);
      setSForm({ name: '', description: '', price: '', duration: 30 });
    } else {
      setSError(data.message ?? 'Błąd');
    }
  };

  const saveHours = async () => {
    const t = await token();
    const res = await fetch(`${API_URL}/api/businesses/${business._id}/hours`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify(hForm),
    });
    if (res.ok) {
      const { business: updated } = await res.json();
      onUpdate(updated);
      setHSaved(true);
      setTimeout(() => setHSaved(false), 2000);
    }
  };

  const adjustDuration = (delta: number) =>
    setSForm((prev) => ({ ...prev, duration: Math.max(10, prev.duration + delta) }));

  return (
    <div className="business-panel">
      <div className="business-panel__header" onClick={() => setExpanded((v) => !v)}>
        <div>
          <strong>{business.name}</strong>
          <span>{business.category} · {business.address}, {business.city}</span>
        </div>
        <span className="business-panel__toggle">{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="business-panel__body">

          {/* Godziny otwarcia */}
          <div className="panel-subsection">
            <h4>Godziny otwarcia</h4>
            <div className="hours-form">
              <label>Od
                <input type="time" value={hForm.open} onChange={(e) => setHForm({ ...hForm, open: e.target.value })} />
              </label>
              <label>Do
                <input type="time" value={hForm.close} onChange={(e) => setHForm({ ...hForm, close: e.target.value })} />
              </label>
              <Button size="sm" variant="primary" onClick={saveHours}>
                {hSaved ? 'Zapisano!' : 'Zapisz'}
              </Button>
            </div>
          </div>

          {/* Usługi */}
          <div className="panel-subsection">
            <div className="panel-subsection__header">
              <h4>Usługi ({services.length})</h4>
              <Button size="sm" variant="ghost" onClick={() => setShowServiceForm((v) => !v)}>
                {showServiceForm ? 'Anuluj' : '+ Dodaj usługę'}
              </Button>
            </div>

            {showServiceForm && (
              <form className="business-form" onSubmit={addService}>
                <input
                  placeholder="Nazwa usługi"
                  value={sForm.name}
                  onChange={(e) => setSForm({ ...sForm, name: e.target.value })}
                  required
                />
                <input
                  placeholder="Opis (opcjonalnie)"
                  value={sForm.description}
                  onChange={(e) => setSForm({ ...sForm, description: e.target.value })}
                />
                <input
                  placeholder="Cena (zł)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={sForm.price}
                  onChange={(e) => setSForm({ ...sForm, price: e.target.value })}
                  required
                />
                <div className="duration-control">
                  <span>Czas trwania:</span>
                  <Button type="button" size="sm" variant="secondary" onClick={() => adjustDuration(-10)}>−10 min</Button>
                  <strong>{sForm.duration} min</strong>
                  <Button type="button" size="sm" variant="secondary" onClick={() => adjustDuration(10)}>+10 min</Button>
                </div>
                {sError && <p className="form-error">{sError}</p>}
                <Button type="submit" variant="primary">Dodaj usługę</Button>
              </form>
            )}

            {services.length === 0 && !showServiceForm && <p className="empty-msg">Brak usług. Dodaj pierwszą.</p>}
            {services.map((s) => (
              <div key={s._id} className="service-item">
                <div>
                  <strong>{s.name}</strong>
                  {s.description && <span>{s.description}</span>}
                </div>
                <div className="service-item__meta">
                  <span>⏱ {s.duration} min</span>
                  <span>{s.price} zł</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

function EmployeeDashboard(): React.JSX.Element {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();

  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  const [showBizForm, setShowBizForm] = useState(false);
  const [bizForm, setBizForm] = useState({ name: '', category: 'beauty', address: '', city: '' });
  const [bizError, setBizError] = useState('');

  useEffect(() => {
    if (!isSignedIn || !user) return;
    fetch(`${API_URL}/api/users/by-clerk/${user.id}`)
      .then((r) => r.json())
      .then((data) => setEmployeeId(data._id));
  }, [isSignedIn, user]);

  useEffect(() => {
    if (!employeeId) return;
    Promise.all([
      fetch(`${API_URL}/api/bookings/employee/${employeeId}`).then((r) => r.json()),
      fetch(`${API_URL}/api/businesses`).then((r) => r.json()),
    ]).then(([bookingData, bizData]) => {
      setBookings(bookingData);
      setBusinesses(bizData.filter((b: Business & { ownerId: { _id: string } | string }) => (typeof b.ownerId === 'string' ? b.ownerId : b.ownerId?._id) === employeeId));
      setLoading(false);
    });
  }, [employeeId]);

  const submitBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setBizError('');
    const token = await getToken();
    const res = await fetch('${API_URL}/api/businesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(bizForm),
    });
    const data = await res.json();
    if (res.ok) {
      setBusinesses((prev) => [...prev, data.business]);
      setShowBizForm(false);
      setBizForm({ name: '', category: 'beauty', address: '', city: '' });
    } else {
      setBizError(data.message ?? 'Błąd');
    }
  };

  const todayBookings = bookings.filter((b) => isToday(b.startTime) && b.status === 'confirmed');
  const upcomingBookings = bookings.filter((b) => !isToday(b.startTime) && new Date(b.startTime) > new Date() && b.status === 'confirmed');
  const completedBookings = bookings.filter((b) => b.status === 'completed');

  const complete = async (bookingId: string) => {
    const res = await fetch(`${API_URL}/api/bookings/${bookingId}/complete`, { method: 'PATCH' });
    if (res.ok) setBookings((prev) => prev.map((b) => b._id === bookingId ? { ...b, status: 'completed' } : b));
  };

  if (loading) return <div className="page-content">Ładowanie...</div>;

  return (
    <div className="page-content">
      <h2>Panel Pracownika</h2>

      {/* Biznesy */}
      <section className="employee-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Moje biznesy ({businesses.length})</h3>
          <Button size="sm" variant="ghost" onClick={() => setShowBizForm((v) => !v)}>
            {showBizForm ? 'Anuluj' : '+ Dodaj biznes'}
          </Button>
        </div>

        {showBizForm && (
          <form className="business-form" onSubmit={submitBusiness}>
            <input placeholder="Nazwa biznesu" value={bizForm.name} onChange={(e) => setBizForm({ ...bizForm, name: e.target.value })} required />
            <select value={bizForm.category} onChange={(e) => setBizForm({ ...bizForm, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input placeholder="Adres" value={bizForm.address} onChange={(e) => setBizForm({ ...bizForm, address: e.target.value })} required />
            <input placeholder="Miasto" value={bizForm.city} onChange={(e) => setBizForm({ ...bizForm, city: e.target.value })} required />
            {bizError && <p className="form-error">{bizError}</p>}
            <Button type="submit" variant="primary">Utwórz biznes</Button>
          </form>
        )}

        {businesses.length === 0 && !showBizForm && <p className="empty-msg">Nie masz jeszcze żadnego biznesu.</p>}
        {businesses.map((b) => (
          <BusinessPanel
            key={b._id}
            business={b}
            token={getToken}
            onUpdate={(updated) => setBusinesses((prev) => prev.map((x) => x._id === updated._id ? updated : x))}
          />
        ))}
      </section>

      {/* Wizyty */}
      <section className="employee-section">
        <h3>Dzisiaj ({todayBookings.length})</h3>
        {todayBookings.length === 0 ? <p className="empty-msg">Brak wizyt na dzisiaj.</p>
          : todayBookings.map((b) => <BookingCard key={b._id} booking={b} onComplete={complete} />)}
      </section>

      <section className="employee-section">
        <h3>Nadchodzące ({upcomingBookings.length})</h3>
        {upcomingBookings.length === 0 ? <p className="empty-msg">Brak zaplanowanych wizyt.</p>
          : upcomingBookings.map((b) => <BookingCard key={b._id} booking={b} onComplete={complete} />)}
      </section>

      <section className="employee-section">
        <h3>Ukończone ({completedBookings.length})</h3>
        {completedBookings.length === 0 ? <p className="empty-msg">Brak ukończonych wizyt.</p>
          : completedBookings.map((b) => <BookingCard key={b._id} booking={b} />)}
      </section>
    </div>
  );
}

function PaymentBadge({ method, status }: { method: Booking['paymentMethod']; status: Booking['paymentStatus'] }) {
  if (method === 'card' && status === 'paid')
    return <span className="payment-badge payment-badge--paid">💳 Zapłacono kartą</span>;
  if (method === 'blik' && status === 'paid')
    return <span className="payment-badge payment-badge--paid">📱 Zapłacono BLIK</span>;
  if (method === 'on_site')
    return <span className="payment-badge payment-badge--onsite">🏠 Płaci na miejscu</span>;
  return null;
}

function BookingCard({ booking, onComplete }: { booking: Booking; onComplete?: (id: string) => void }): React.JSX.Element {
  const { clientId: client, serviceId: service } = booking;
  return (
    <div className={`booking-card ${booking.status === 'completed' ? 'booking-card--completed' : ''}`}>
      <div className="booking-card__time">
        <span className="booking-card__date">{formatDate(booking.startTime)}</span>
        <span className="booking-card__hours">{formatTime(booking.startTime)} – {formatTime(booking.endTime)}</span>
      </div>
      <div className="booking-card__info">
        <strong>{service.name}</strong>
        <span>{client.firstName} {client.lastName}</span>
        <span className="booking-card__meta">{client.email}{client.phoneNumber ? ` · ${client.phoneNumber}` : ''}</span>
        <span className="booking-card__meta">{service.duration} min · {service.price} zł</span>
        <PaymentBadge method={booking.paymentMethod} status={booking.paymentStatus} />
      </div>
      <div className="booking-card__actions">
        {booking.status === 'confirmed' && onComplete && (
          <Button size="sm" variant="primary" onClick={() => onComplete(booking._id)}>Oznacz ukończoną</Button>
        )}
        {booking.status === 'completed' && <span className="booking-card__done">Ukończona</span>}
      </div>
    </div>
  );
}

export default EmployeeDashboard;
