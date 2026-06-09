import React, { useEffect, useState } from 'react';
import Button from '../components/Button';
import API_URL from '../config';

interface User {
  _id: string;
  clerkId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'client' | 'employee' | 'admin';
  phoneNumber?: string;
}

const ROLE_LABELS: Record<string, string> = {
  client: 'Klient',
  employee: 'Pracownik',
  admin: 'Admin',
};

const ROLE_VARIANT: Record<string, 'primary' | 'secondary' | 'danger'> = {
  client: 'secondary',
  employee: 'primary',
  admin: 'danger',
};

function AdminDashboard(): React.JSX.Element {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/users`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Nie udało się pobrać użytkowników');
        setLoading(false);
      });
  }, []);

  const changeRole = async (userId: string, newRole: string) => {
    const res = await fetch(`${API_URL}/api/users/${userId}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });

    if (res.ok) {
      const { user: updated } = await res.json();
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
    }
  };

  if (loading) return <div className="page-content">Ładowanie...</div>;
  if (error) return <div className="page-content">{error}</div>;

  return (
    <div className="page-content">
      <h2>Panel Admina — Zarządzanie Użytkownikami</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #ccc', textAlign: 'left' }}>
            <th style={{ padding: '8px' }}>Imię i nazwisko</th>
            <th style={{ padding: '8px' }}>Email</th>
            <th style={{ padding: '8px' }}>Rola</th>
            <th style={{ padding: '8px' }}>Zmień rolę</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{user.firstName} {user.lastName}</td>
              <td style={{ padding: '8px' }}>{user.email}</td>
              <td style={{ padding: '8px' }}>{ROLE_LABELS[user.role]}</td>
              <td style={{ padding: '8px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['client', 'employee', 'admin'] as const).map((role) => (
                    <Button
                      key={role}
                      size="sm"
                      variant={ROLE_VARIANT[role]}
                      disabled={user.role === role}
                      onClick={() => changeRole(user._id, role)}
                    >
                      {ROLE_LABELS[role]}
                    </Button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
