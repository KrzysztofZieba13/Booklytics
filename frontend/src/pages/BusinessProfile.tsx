import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}

interface AvailableSlot {
  time: string;
  dateTime: string;
}

function BusinessProfile(): React.JSX.Element {
  const { id: businessId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // Stany dla danych z API
  const [services, setServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);

  // Stany wyboru użytkownika
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  
  // Stany pomocnicze
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/services/business/${businessId}`);
        if (response.ok) {
          const data = await response.json();
          setServices(data);
        }
      } catch (err) {
        console.error('Błąd pobierania usług:', err);
      }
    };
    if (businessId) fetchServices();
  }, [businessId]);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (!selectedService || !selectedDate) return;
      
      try {
        setLoadingSlots(true);
        setBookingMessage(null);
        const employeeId = "60d5ecb8b394d01428238411"; 
        
        const response = await fetch(
          `http://localhost:5000/api/bookings/available-slots?employeeId=${employeeId}&serviceId=${selectedService._id}&date=${selectedDate}`
        );
        
        if (response.ok) {
          const data = await response.json();
          setAvailableSlots(data);
        }
      } catch (err) {
        console.error('Błąd pobierania slotów:', err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedService, selectedDate]);

  const handleBookSlot = async (slotDateTime: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/bookings/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          serviceId: selectedService?._id,
          clientId: "60d5ecb8b394d01428238499", // Testowy klient
          employeeId: "60d5ecb8b394d01428238411", // Testowy pracownik
          startTime: slotDateTime
        })
      });

      const data = await response.json();

      if (response.ok) {
        navigate(`/summary/${data.booking._id}`);
      } else {
        setBookingMessage(`❌ Błąd: ${data.message}`);
      }
    } catch (err) {
      setBookingMessage('❌ Błąd połączenia z serwerem.');
    }
  };

return (
    <div className="business-profile-page">
      <h2>Zarezerwuj wizytę</h2>
      <p className="subtitle">Wybierz interesującą Cię usługę oraz dogodny termin.</p>

      <div className="booking-container">
        {/* KROK A: Lista usług */}
        <div className="services-section">
          <h3>1. Wybierz usługę</h3>
          <div className="services-list">
            {services.map(service => (
              <div 
                key={service._id} 
                className={`service-selectable-item ${selectedService?._id === service._id ? 'active' : ''}`}
                onClick={() => setSelectedService(service)}
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

        {/* KROK B: Kalendarz i Sloty */}
        <div className="datetime-section">
          <h3>2. Wybierz dzień i godzinę</h3>
          
          <div className="date-picker-box">
            <label>Data wizyty:</label>
            <input 
              type="date" 
              min="2026-05-22" // Blokada na daty przeszłe
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)}
              disabled={!selectedService}
            />
            {!selectedService && <p className="hint">👈 Najpierw wybierz usługę z listy</p>}
          </div>

          {/* Wyświetlanie godzin */}
          {selectedService && selectedDate && (
            <div className="slots-box">
              <h4>Dostępne godziny na dzień {selectedDate}:</h4>
              
              {loadingSlots && <p>Obliczanie wolnych terminów...</p>}
              
              {!loadingSlots && availableSlots.length === 0 && (
                <p className="no-slots">Brak wolnych miejsc w tym dniu. Wybierz inną datę.</p>
              )}

              <div className="slots-grid">
                {availableSlots.map(slot => (
                  <button 
                    key={slot.dateTime} 
                    className="slot-btn"
                    onClick={() => handleBookSlot(slot.dateTime)}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Komunikat o statusie rezerwacji */}
          {bookingMessage && <div className="booking-alert">{bookingMessage}</div>}
        </div>
      </div>
    </div>
  );
}

export default BusinessProfile;