import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';

interface Booking {
  _id: string;
  status: 'temporary_lock' | 'confirmed' | 'cancelled' | 'completed';
  startTime: string;
  endTime: string;
  serviceId: { name: string; duration: number; price: number };
  employeeId: { firstName: string; lastName: string };
  businessId: { name: string; address: string; city: string };
}

const STATUS_LABEL: Record<string, string> = {
  temporary_lock: 'Oczekuje na potwierdzenie',
  confirmed: 'Potwierdzona',
  cancelled: 'Anulowana',
  completed: 'Ukończona',
};

const STATUS_COLOR: Record<string, string> = {
  temporary_lock: '#f59e0b',
  confirmed: '#10b981',
  cancelled: '#ef4444',
  completed: '#94a3b8',
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pl-PL', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  });
}

function MyBookings(): React.JSX.Element {
  const { user, isSignedIn } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSignedIn || !user) return;
    fetch(`http://localhost:5000/api/users/by-clerk/${user.id}`)
      .then((r) => r.json())
      .then(({ _id }) => fetch(`http://localhost:5000/api/bookings/client/${_id}`))
      .then((r) => r.json())
      .then((data) => { setBookings(data); setLoading(false); });
  }, [isSignedIn, user]);

  if (!isSignedIn) return (
    <div className="page-content" style={{ textAlign: 'center' }}>
      <p>Musisz być zalogowany, aby zobaczyć swoje wizyty.</p>
    </div>
  );

  if (loading) return <div className="page-content">Ładowanie...</div>;

  const upcoming = bookings.filter((b) => ['confirmed', 'temporary_lock'].includes(b.status) && new Date(b.startTime) > new Date());
  const past = bookings.filter((b) => b.status === 'completed' || new Date(b.startTime) <= new Date());

  return (
    <div className="page-content">
      <h2>Moje wizyty</h2>

      <section className="employee-section">
        <h3>Nadchodzące ({upcoming.length})</h3>
        {upcoming.length === 0
          ? <p className="empty-msg">Nie masz zaplanowanych wizyt. <Link to="/">Znajdź usługę</Link></p>
          : upcoming.map((b) => <ClientBookingCard key={b._id} booking={b} />)
        }
      </section>

      <section className="employee-section">
        <h3>Historia ({past.length})</h3>
        {past.length === 0
          ? <p className="empty-msg">Brak historii wizyt.</p>
          : past.map((b) => <ClientBookingCard key={b._id} booking={b} />)
        }
      </section>
    </div>
  );
}

function ClientBookingCard({ booking }: { booking: Booking }): React.JSX.Element {
  return (
    <div className="booking-card">
      <div className="booking-card__time">
        <span className="booking-card__date" style={{ fontSize: '0.7rem' }}>
          {new Date(booking.startTime).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}
        </span>
        <span className="booking-card__hours">
          {new Date(booking.startTime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className="booking-card__info">
        <strong>{booking.serviceId.name}</strong>
        <span>{booking.businessId.name} · {booking.businessId.city}</span>
        <span className="booking-card__meta">
          {booking.employeeId.firstName} {booking.employeeId.lastName} · {booking.serviceId.duration} min · {booking.serviceId.price} zł
        </span>
        <span className="booking-card__meta" style={{ color: STATUS_COLOR[booking.status], fontWeight: 600 }}>
          {STATUS_LABEL[booking.status]}
        </span>
      </div>
    </div>
  );
}

export default MyBookings;
