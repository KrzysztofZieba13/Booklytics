import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}

interface Business {
  _id: string;
  name: string;
  ownerId: { _id: string; firstName: string; lastName: string };
  openingHours: { open: string; close: string };
}

interface AvailableSlot {
  time: string;
  dateTime: string;
}

function BusinessProfile(): React.JSX.Element {
  const { id: businessId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();

  const [business, setBusiness] = useState<Business | null>(null);
  const [clientMongoId, setClientMongoId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!businessId) return;
    Promise.all([
      fetch(`http://localhost:5000/api/businesses/${businessId}`).then((r) => r.json()),
      fetch(`http://localhost:5000/api/services/business/${businessId}`).then((r) => r.json()),
    ]).then(([biz, svcs]) => {
      setBusiness(biz);
      setServices(svcs);
    });
  }, [businessId]);

  useEffect(() => {
    if (!isSignedIn || !user) return;
    fetch(`http://localhost:5000/api/users/by-clerk/${user.id}`)
      .then((r) => r.json())
      .then((data) => setClientMongoId(data._id));
  }, [isSignedIn, user]);

  useEffect(() => {
    if (!selectedService || !selectedDate || !business) return;
    setLoadingSlots(true);
    setBookingMessage(null);
    const employeeId = business.ownerId._id;
    fetch(`http://localhost:5000/api/bookings/available-slots?employeeId=${employeeId}&serviceId=${selectedService._id}&date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => { setAvailableSlots(data); setLoadingSlots(false); })
      .catch(() => setLoadingSlots(false));
  }, [selectedService, selectedDate, business]);

  const handleBookSlot = async (slotDateTime: string) => {
    if (!isSignedIn) {
      setBookingMessage('Musisz być zalogowany, aby zarezerwować wizytę.');
      return;
    }
    if (!clientMongoId) {
      setBookingMessage('Nie znaleziono Twojego konta. Spróbuj ponownie.');
      return;
    }
    const res = await fetch('http://localhost:5000/api/bookings/lock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessId,
        serviceId: selectedService?._id,
        clientId: clientMongoId,
        employeeId: business?.ownerId._id,
        startTime: slotDateTime,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      navigate(`/summary/${data.booking._id}`);
    } else {
      setBookingMessage(`Błąd: ${data.message}`);
    }
  };

  return (
    <div className="business-profile-page">
      <h2>Zarezerwuj wizytę{business ? ` — ${business.name}` : ''}</h2>
      <p className="subtitle">Wybierz interesującą Cię usługę oraz dogodny termin.</p>

      <div className="booking-container">
        <div className="services-section">
          <h3>1. Wybierz usługę</h3>
          <div className="services-list">
            {services.length === 0 && <p>Brak dostępnych usług.</p>}
            {services.map((service) => (
              <div
                key={service._id}
                className={`service-selectable-item ${selectedService?._id === service._id ? 'active' : ''}`}
                onClick={() => { setSelectedService(service); setAvailableSlots([]); setSelectedDate(''); }}
              >
                <div>
                  <h4>{service.name}</h4>
                  <p>{service.description || 'Brak opisu'}</p>
                </div>
                <div className="service-meta">
                  <span className="duration">⏱️ {service.duration} min</span>
                  <span className="price">{service.price} PLN</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="datetime-section">
          <h3>2. Wybierz dzień i godzinę</h3>
          <div className="date-picker-box">
            <label>Data wizyty:</label>
            <input
              type="date"
              min={today}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              disabled={!selectedService}
            />
            {!selectedService && <p className="hint">👈 Najpierw wybierz usługę z listy</p>}
          </div>

          {selectedService && selectedDate && (
            <div className="slots-box">
              <h4>Dostępne godziny na dzień {selectedDate}:</h4>
              {loadingSlots && <p>Obliczanie wolnych terminów...</p>}
              {!loadingSlots && availableSlots.length === 0 && (
                <p className="no-slots">Brak wolnych miejsc w tym dniu.</p>
              )}
              <div className="slots-grid">
                {availableSlots.map((slot) => (
                  <button key={slot.dateTime} className="slot-btn" onClick={() => handleBookSlot(slot.dateTime)}>
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {bookingMessage && <div className="booking-alert">{bookingMessage}</div>}
        </div>
      </div>
    </div>
  );
}

export default BusinessProfile;
