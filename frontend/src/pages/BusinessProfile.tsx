import React from 'react';
import { useParams } from 'react-router-dom';

function BusinessProfile(): React.JSX.Element {
  const { id } = useParams<{ id: string }>(); // Pobieramy dynamiczne ID z adresu URL

  return (
    <div className="page-content">
      <h2>📅 Profil Biznesu (ID: {id})</h2>
      <p>Tutaj wyświetlimy listę usług danego biznesu oraz nasz algorytm wolnych slotów godzinowych.</p>
    </div>
  );
}

export default BusinessProfile;