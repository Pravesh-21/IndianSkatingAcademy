'use client';

import { useState, useEffect } from 'react';

type Registration = {
  id: number;
  name: string;
  age: number;
  phone: string;
  discipline: string;
  method: string;
  submitted_at: string;
};

type Inquiry = {
  id: number;
  name: string;
  phone: string;
  message: string;
  submitted_at: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function AdminPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State for editing
  const [editingInquiry, setEditingInquiry] = useState<Inquiry | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editMessage, setEditMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [regRes, inqRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/registrations`),
        fetch(`${API_URL}/api/admin/inquiries`)
      ]);

      const regData = await regRes.json();
      const inqData = await inqRes.json();

      if (regData.success) setRegistrations(regData.data);
      if (inqData.success) setInquiries(inqData.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load data from server.');
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteInquiry = async (id: number) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/inquiries/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setInquiries(inquiries.filter(inq => inq.id !== id));
      } else {
        alert(data.message || 'Failed to delete inquiry');
      }
    } catch (err) {
      console.error('Error deleting inquiry:', err);
      alert('Failed to delete inquiry');
    }
  };

  const startEdit = (inq: Inquiry) => {
    setEditingInquiry(inq);
    setEditName(inq.name);
    setEditPhone(inq.phone);
    setEditMessage(inq.message || '');
  };

  const cancelEdit = () => {
    setEditingInquiry(null);
  };

  const handleUpdateInquiry = async () => {
    if (!editingInquiry) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/inquiries/${editingInquiry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, phone: editPhone, message: editMessage }),
      });
      const data = await res.json();
      if (data.success) {
        setInquiries(inquiries.map(inq => inq.id === editingInquiry.id ? data.data : inq));
        setEditingInquiry(null);
      } else {
        alert(data.message || 'Failed to update inquiry');
      }
    } catch (err) {
      console.error('Error updating inquiry:', err);
      alert('Failed to update inquiry');
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      padding: '2rem',
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    wrapper: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    title: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      marginBottom: '2rem',
      textAlign: 'center' as const,
      color: '#d4af37', // Gold color
    },
    section: {
      marginBottom: '3rem',
    },
    sectionTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      marginBottom: '1rem',
      color: '#f1f1f1',
    },
    tableWrapper: {
      overflowX: 'auto' as const,
      backgroundColor: '#141414',
      borderRadius: '8px',
      border: '1px solid #333',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      textAlign: 'left' as const,
    },
    th: {
      padding: '1rem',
      backgroundColor: '#1a1a1a',
      borderBottom: '1px solid #333',
      color: '#888',
      fontWeight: '500',
    },
    td: {
      padding: '1rem',
      borderBottom: '1px solid #222',
    },
    empty: {
      padding: '2rem',
      textAlign: 'center' as const,
      color: '#666',
    },
    error: {
      color: '#ff4a4a',
      textAlign: 'center' as const,
    },
    loading: {
      color: '#888',
      textAlign: 'center' as const,
    },
    btn: {
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      border: 'none',
      cursor: 'pointer',
      fontWeight: 'bold',
      marginRight: '0.5rem',
    },
    btnEdit: {
      backgroundColor: '#d4af37',
      color: '#000',
    },
    btnDelete: {
      backgroundColor: '#ff4a4a',
      color: '#fff',
    },
    input: {
      padding: '0.5rem',
      backgroundColor: '#222',
      border: '1px solid #444',
      borderRadius: '4px',
      color: '#fff',
      width: '100%',
    }
  };

  return (
    <main style={styles.container}>
      <div style={styles.wrapper}>
        <h1 style={styles.title}>Admin Dashboard</h1>

        {loading ? (
          <p style={styles.loading}>Loading requests...</p>
        ) : error ? (
          <p style={styles.error}>{error}</p>
        ) : (
          <div>
            {/* Registrations Section */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Event Registrations</h2>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Age</th>
                      <th style={styles.th}>Phone</th>
                      <th style={styles.th}>Discipline</th>
                      <th style={styles.th}>Method</th>
                      <th style={styles.th}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.length === 0 ? (
                      <tr><td colSpan={6} style={styles.empty}>No registrations found</td></tr>
                    ) : (
                      registrations.map(reg => (
                        <tr key={reg.id}>
                          <td style={styles.td}>{reg.name}</td>
                          <td style={styles.td}>{reg.age}</td>
                          <td style={styles.td}>{reg.phone}</td>
                          <td style={styles.td}>{reg.discipline}</td>
                          <td style={styles.td}>{reg.method}</td>
                          <td style={styles.td}>{new Date(reg.submitted_at).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Inquiries Section */}
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>General Inquiries</h2>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Phone</th>
                      <th style={styles.th}>Message</th>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.length === 0 ? (
                      <tr><td colSpan={5} style={styles.empty}>No inquiries found</td></tr>
                    ) : (
                      inquiries.map(inq => (
                        <tr key={inq.id}>
                          <td style={styles.td}>
                            {editingInquiry?.id === inq.id ? (
                              <input style={styles.input} value={editName} onChange={e => setEditName(e.target.value)} />
                            ) : (
                              inq.name
                            )}
                          </td>
                          <td style={styles.td}>
                            {editingInquiry?.id === inq.id ? (
                              <input style={styles.input} value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                            ) : (
                              inq.phone
                            )}
                          </td>
                          <td style={styles.td}>
                            {editingInquiry?.id === inq.id ? (
                              <input style={styles.input} value={editMessage} onChange={e => setEditMessage(e.target.value)} />
                            ) : (
                              inq.message || <span style={{color: '#444'}}>No message</span>
                            )}
                          </td>
                          <td style={styles.td}>{new Date(inq.submitted_at).toLocaleString()}</td>
                          <td style={styles.td}>
                            {editingInquiry?.id === inq.id ? (
                              <>
                                <button style={{...styles.btn, ...styles.btnEdit}} onClick={handleUpdateInquiry}>Save</button>
                                <button style={{...styles.btn, backgroundColor: '#444', color: '#fff'}} onClick={cancelEdit}>Cancel</button>
                              </>
                            ) : (
                              <>
                                <button style={{...styles.btn, ...styles.btnEdit}} onClick={() => startEdit(inq)}>Edit</button>
                                <button style={{...styles.btn, ...styles.btnDelete}} onClick={() => handleDeleteInquiry(inq.id)}>Delete</button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
