import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../config';

interface Business {
  _id: string;
  name: string;
  category: string;
  address: string;
  city: string;
  ownerId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

function Home(): React.JSX.Element {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/businesses`);
        
        if (!response.ok) {
          throw new Error('Nie udało się pobrać listy punktów usługowych.');
        }

        const data = await response.json();
        setBusinesses(data);
      } catch (err: any) {
        setError(err.message || 'Wystąpił nieoczekiwany błąd.');
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  return (
    <div className="home-page">
      <div className="home-header">
        <h2>🍃 Znajdź i zarezerwuj lokalne usługi</h2>
        <p>Wybierz punkt usługowy w Twojej okolicy i umów się na wizytę w kilka sekund.</p>
      </div>

      {/* 1. Stan ładowania */}
      {loading && <p className="status-msg">Ładowanie dostępnych punktów...</p>}

      {/* 2. Obsługa błędu */}
      {error && <p className="status-msg error-msg">❌ {error}</p>}

      {/* 3. Brak wyników */}
      {!loading && !error && businesses.length === 0 && (
        <p className="status-msg">Obecnie brak zarejestrowanych biznesów w bazie danych.</p>
      )}

      {/* 4. Lista biznesów wyrenderowana w ładnych kartach */}
      <div className="business-grid">
        {businesses.map((business) => (
          <div key={business._id} className="business-card">
            <span className={`category-badge ${business.category}`}>
              {business.category.toUpperCase()}
            </span>
            <h3>{business.name}</h3>
            <p className="address">📍 {business.address}, {business.city}</p>
            <p className="owner">Właściciel: {business.ownerId?.firstName} {business.ownerId?.lastName}</p>
            
            <Link to={`/business/${business._id}`} className="btn-view">
              Zobacz usługi i kalendarz
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;