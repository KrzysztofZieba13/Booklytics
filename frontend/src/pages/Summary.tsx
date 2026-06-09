import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import API_URL from '../config';

interface BookingDetails {
  _id: string;
  status: string;
  paymentMethod: 'card' | 'blik' | 'on_site' | null;
  paymentStatus: string;
  startTime: string;
  endTime: string;
  serviceId: { name: string; price: number; duration: number };
  businessId: { name: string; address: string; city: string };
  employeeId: { firstName: string; lastName: string };
}

function Summary(): React.JSX.Element {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentParam = searchParams.get('payment');

  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    fetch(`${API_URL}/api/bookings/${bookingId}`)
      .then((r) => r.json())
      .then((data) => { setBooking(data); setLoading(false); })
      .catch(() => { setError('Nie udało się pobrać szczegółów rezerwacji.'); setLoading(false); });
  }, [bookingId]);

  useEffect(() => {
    if (paymentParam === 'success' && bookingId && booking && booking.status === 'temporary_lock') {
      confirmBooking('online');
    }
    if (booking?.status === 'confirmed') {
      setSuccess(true);
    }
  }, [paymentParam, booking]);

  const confirmBooking = async (paymentMethod: 'online' | 'on_site') => {
    if (!bookingId) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/bookings/confirm/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Nie udało się potwierdzić rezerwacji.');
      }
    } catch {
      setError('Błąd połączenia z serwerem.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayOnline = async () => {
    if (!bookingId) return;
    setActionLoading(true);
    setError(null);
    try {
      const res = await fetch('${API_URL}/api/payments/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.message || 'Nie udało się uruchomić płatności.');
        setActionLoading(false);
      }
    } catch {
      setError('Błąd połączenia z serwerem.');
      setActionLoading(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('pl-PL', { dateStyle: 'long', timeStyle: 'short' });

  if (loading) return <div className="summary-page"><p>Ładowanie szczegółów...</p></div>;

  return (
    <div className="summary-page">
      {success ? (
        <div className="summary-card success-state">
          <span className="summary-icon">🎉</span>
          <h2>Wizyta potwierdzona!</h2>
          <p className="summary-sub">Termin został zapisany w kalendarzu. Usługodawca został powiadomiony.</p>
          {booking && (
            <div className="booking-details-box">
              <p><strong>{booking.serviceId?.name}</strong></p>
              <p>📍 {booking.businessId?.name}, {booking.businessId?.city}</p>
              <p>📅 {formatDate(booking.startTime)}</p>
              <p>
                💳 {{ card: 'Opłacono kartą', blik: 'Opłacono BLIK', on_site: 'Płatność na miejscu' }[booking.paymentMethod ?? 'on_site']}
              </p>
            </div>
          )}
          <button className="btn-primary btn-full" onClick={() => navigate('/')}>
            Wróć do strony głównej
          </button>
        </div>
      ) : paymentParam === 'cancel' ? (
        <div className="summary-card">
          <span className="summary-icon">↩️</span>
          <h2>Płatność anulowana</h2>
          <p className="summary-sub">Możesz wybrać inną metodę płatności. Blokada terminu nadal trwa.</p>
          {error && <p className="summary-error">{error}</p>}
          <div className="payment-options">
            <button className="btn-payment btn-online" onClick={handlePayOnline} disabled={actionLoading}>
              💳 Spróbuj zapłacić ponownie
            </button>
            <button className="btn-payment btn-onsite" onClick={() => confirmBooking('on_site')} disabled={actionLoading}>
              🏠 Zapłać na miejscu
            </button>
          </div>
        </div>
      ) : (
        <div className="summary-card">
          <span className="summary-icon">🔒</span>
          <h2>Termin zarezerwowany!</h2>
          <p className="summary-sub">
            Masz <strong>10 minut</strong> na dokończenie rezerwacji. Wybierz metodę płatności.
          </p>

          {booking && (
            <div className="booking-details-box">
              <p><strong>{booking.serviceId?.name}</strong></p>
              <p>📍 {booking.businessId?.name}, {booking.businessId?.city}</p>
              <p>📅 {formatDate(booking.startTime)}</p>
              <p>⏱️ {booking.serviceId?.duration} min &nbsp;·&nbsp; <strong>{booking.serviceId?.price} PLN</strong></p>
              <p>👤 {booking.employeeId?.firstName} {booking.employeeId?.lastName}</p>
            </div>
          )}

          {error && <p className="summary-error">{error}</p>}

          <div className="payment-options">
            <button className="btn-payment btn-online" onClick={handlePayOnline} disabled={actionLoading}>
              <span className="btn-payment-icon">💳</span>
              <span>
                <strong>Zapłać online</strong>
                <small>Karta lub BLIK — szybko i bezpiecznie</small>
              </span>
            </button>
            <button className="btn-payment btn-onsite" onClick={() => confirmBooking('on_site')} disabled={actionLoading}>
              <span className="btn-payment-icon">🏠</span>
              <span>
                <strong>Zapłać na miejscu</strong>
                <small>Gotówka lub karta przy wizycie</small>
              </span>
            </button>
          </div>

          {actionLoading && <p className="summary-sub" style={{ marginTop: '1rem' }}>Przetwarzanie...</p>}
        </div>
      )}
    </div>
  );
}

export default Summary;
