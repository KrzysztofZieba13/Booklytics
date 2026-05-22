import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function Summary(): React.JSX.Element {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmBooking = async () => {
    if (!bookingId) return;
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:5000/api/bookings/confirm/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Nie udało się potwierdzić rezerwacji.');
      }
    } catch (err) {
      setError('Błąd połączenia z serwerem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="summary-page page-content" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
      {!success ? (
        <>
          <h2>🔒 Twój termin został zarezerwowany!</h2>
          <p style={{ color: '#64748b', margin: '1rem 0 2rem 0' }}>
            Masz 10 minut na ostateczne potwierdzenie tej wizyty. Po tym czasie blokada wygaśnie, a termin wróci do puli dostępnych.
          </p>
          
          <div className="booking-info-box" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', fontSize: '0.9rem', color: '#475569' }}>
            <p><strong>Identyfikator sesji rezerwacji:</strong></p>
            <p style={{ fontFamily: 'monospace', marginTop: '0.25rem' }}>{bookingId}</p>
          </div>

          {error && <p style={{ color: '#ef4444', marginBottom: '1rem', fontWeight: 600 }}>❌ {error}</p>}

          <button 
            className="btn-primary" 
            style={{ width: '100%', padding: '1rem' }}
            onClick={handleConfirmBooking}
            disabled={loading}
          >
            {loading ? 'Zapisywanie w bazie...' : 'Potwierdzam rezerwację na stałe'}
          </button>
        </>
      ) : (
        <div className="success-box">
          <span style={{ fontSize: '3rem' }}>🎉</span>
          <h2 style={{ color: '#10b981', marginTop: '1rem' }}>Wizyta potwierdzona!</h2>
          <p style={{ color: '#64748b', margin: '1rem 0 2rem 0' }}>
            Termin został pomyślnie zapisany w kalendarzu. Usługodawca został powiadomiony o Twojej wizycie.
          </p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Wróć do strony głównej
          </button>
        </div>
      )}
    </div>
  );
}

export default Summary;