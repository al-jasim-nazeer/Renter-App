"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Home, Users, Building, Calendar, ShieldAlert, Edit, Trash2, Plus } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Property {
    id: number;
    title: string;
    price: number;
    propertyType: string;
}

interface Booking {
    id: number;
    propertyId: number;
    renterId: number;
    startDate: string;
    endDate: string;
    status: string;
}

export default function AdminPanel() {
    const [activeTab, setActiveTab] = useState<'users' | 'properties' | 'bookings'>('users');
    const [users, setUsers] = useState<User[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [modalConfig, setModalConfig] = useState<any>({ isOpen: false, type: '', mode: '', id: null });
    const [formData, setFormData] = useState<any>({});

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7249/api";

    const fetchAdminData = async () => {
        setLoading(true);
        setError("");
        const token = localStorage.getItem("token");
        if (!token) {
            setError("No token found. Please login as Admin.");
            setLoading(false);
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            let hasAnySuccess = false;

            try {
                const usersRes = await axios.get(`${API_URL}/Admin/users`, config);
                setUsers(usersRes.data);
                hasAnySuccess = true;
            } catch (e) { console.error("Access hidden for users"); }

            try {
                const propertiesRes = await axios.get(`${API_URL}/Admin/properties`, config);
                setProperties(propertiesRes.data);
                hasAnySuccess = true;
            } catch (e) { console.error("Access hidden for properties"); }

            try {
                const bookingsRes = await axios.get(`${API_URL}/Admin/bookings`, config);
                setBookings(bookingsRes.data);
                hasAnySuccess = true;
            } catch (e) { console.error("Access hidden for bookings"); }

            if (!hasAnySuccess) {
                setError("Forbidden: Admin or Owner access required.");
            }

        } catch (err: any) {
            console.error(err);
            setError("Failed to load admin data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    const handleDelete = async (type: string, id: number) => {
        const token = localStorage.getItem("token");
        if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
        try {
            await axios.delete(`${API_URL}/Admin/${type}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`${type} deleted successfully!`);
            fetchAdminData(); // Refresh
        } catch (err) {
            alert(`Failed to delete ${type}`);
        }
    };

    const handleEdit = (type: string, id: number) => {
        let item: any = {};
        if (type === 'users') item = users.find(u => u.id === id);
        if (type === 'properties') item = properties.find(p => p.id === id);
        if (type === 'bookings') item = bookings.find(b => b.id === id);
        setFormData(item || {});
        setModalConfig({ isOpen: true, type, mode: 'edit', id });
    };

    const handleCreate = (type: string) => {
        setFormData({});
        setModalConfig({ isOpen: true, type, mode: 'create', id: null });
    };

    const handleModalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            if (modalConfig.type === 'properties') {
                if (modalConfig.mode === 'create') {
                    await axios.post(`${API_URL}/Property`, formData, config);
                } else {
                    await axios.put(`${API_URL}/Property/${modalConfig.id}`, formData, config);
                }
            } else if (modalConfig.type === 'bookings') {
                if (modalConfig.mode === 'create') {
                    await axios.post(`${API_URL}/Booking`, formData, config);
                } else {
                    await axios.put(`${API_URL}/Booking/${modalConfig.id}`, formData, config);
                }
            } else if (modalConfig.type === 'users') {
                alert("User creation/editing not implemented yet");
                return;
            }
            alert(`${modalConfig.type} saved successfully!`);
            setModalConfig({ isOpen: false, type: '', mode: '', id: null });
            fetchAdminData();
        } catch (err) {
            console.error(err);
            alert(`Failed to save ${modalConfig.type}`);
        }
    };

    const handleUpdateBookingStatus = async (id: number, action: 'approve' | 'reject') => {
        const token = localStorage.getItem("token");
        try {
            await axios.put(`${API_URL}/Booking/${id}/${action}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`Booking ${action}d successfully!`);
            fetchAdminData();
        } catch (err) {
            alert(`Failed to ${action} booking.`);
        }
    };

    if (error) {
        return (
            <div className="premium-gradient" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px' }}>
                    <ShieldAlert size={64} color="#ff4d4d" style={{ margin: '0 auto 1.5rem' }} />
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 'bold' }}>Access Denied</h2>
                    <p style={{ opacity: 0.8, marginBottom: '2rem' }}>{error}</p>
                    <a href="/" style={{ padding: '0.75rem 1.5rem', background: 'var(--primary)', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold' }}>
                        Return to Home
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="premium-gradient" style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
            <nav className="glass-nav" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 'bold', fontSize: '1.25rem' }}>
                    <ShieldAlert color="var(--primary)" size={28} />
                    <span>Lucid<span style={{ color: "var(--primary)" }}>Admin</span></span>
                </div>
                <a href="/" style={{ color: 'var(--foreground)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                    <Home size={18} /> Exit Admin
                </a>
            </nav>

            <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto', padding: '2rem', gap: '2rem', alignItems: 'flex-start' }}>
                {/* Sidebar */}
                <aside className="glass-card" style={{ width: '250px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'sticky', top: '100px' }}>
                    <button onClick={() => setActiveTab('users')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', background: activeTab === 'users' ? 'var(--primary-glow)' : 'transparent', border: 'none', color: 'var(--foreground)', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left', transition: 'all 0.2s' }}>
                        <Users size={20} /> Users
                    </button>
                    <button onClick={() => setActiveTab('properties')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', background: activeTab === 'properties' ? 'var(--primary-glow)' : 'transparent', border: 'none', color: 'var(--foreground)', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left', transition: 'all 0.2s' }}>
                        <Building size={20} /> Properties
                    </button>
                    <button onClick={() => setActiveTab('bookings')} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderRadius: '12px', background: activeTab === 'bookings' ? 'var(--primary-glow)' : 'transparent', border: 'none', color: 'var(--foreground)', cursor: 'pointer', fontWeight: 'bold', textAlign: 'left', transition: 'all 0.2s' }}>
                        <Calendar size={20} /> Bookings
                    </button>
                </aside>

                {/* content */}
                <main style={{ flex: 1 }}>
                    {loading ? (
                        <div style={{ padding: '4rem', textAlign: 'center', fontSize: '1.5rem', opacity: 0.5 }}>Loading Admin Dashboard...</div>
                    ) : (
                        <div className="glass-card animated-fade-in" style={{ padding: '2rem', overflowX: 'auto' }}>

                            {activeTab === 'users' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Manage Users</h2>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <span style={{ padding: '0.5rem 1rem', background: 'var(--primary-glow)', borderRadius: '20px', fontWeight: 'bold' }}>Total: {users.length}</span>
                                            <button onClick={() => handleCreate('users')} className="btn-primary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '20px' }}><Plus size={16} /> Create User</button>
                                        </div>
                                    </div>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                                <th style={{ padding: '1rem' }}>ID</th>
                                                <th style={{ padding: '1rem' }}>Name</th>
                                                <th style={{ padding: '1rem' }}>Email</th>
                                                <th style={{ padding: '1rem' }}>Role</th>
                                                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(u => (
                                                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '1rem', opacity: 0.7 }}>#{u.id}</td>
                                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{u.name}</td>
                                                    <td style={{ padding: '1rem' }}>{u.email}</td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.8rem', background: u.role === 'Admin' ? 'rgba(255,0,0,0.2)' : u.role === 'Owner' ? 'rgba(0,255,0,0.2)' : 'rgba(0,0,255,0.2)' }}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                        <button onClick={() => handleEdit('users', u.id)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginRight: '1rem' }}><Edit size={18} /></button>
                                                        <button onClick={() => handleDelete('users', u.id)} style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'properties' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Manage Properties</h2>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <span style={{ padding: '0.5rem 1rem', background: 'var(--primary-glow)', borderRadius: '20px', fontWeight: 'bold' }}>Total: {properties.length}</span>
                                            <button onClick={() => handleCreate('properties')} className="btn-primary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '20px' }}><Plus size={16} /> Create Property</button>
                                        </div>
                                    </div>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                                <th style={{ padding: '1rem' }}>ID</th>
                                                <th style={{ padding: '1rem' }}>Title</th>
                                                <th style={{ padding: '1rem' }}>Type</th>
                                                <th style={{ padding: '1rem' }}>Price</th>
                                                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {properties.map(p => (
                                                <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '1rem', opacity: 0.7 }}>#{p.id}</td>
                                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{p.title}</td>
                                                    <td style={{ padding: '1rem' }}>{p.propertyType}</td>
                                                    <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 'bold' }}>${p.price}</td>
                                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                        <button onClick={() => handleEdit('properties', p.id)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginRight: '1rem' }}><Edit size={18} /></button>
                                                        <button onClick={() => handleDelete('properties', p.id)} style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {activeTab === 'bookings' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Manage Bookings</h2>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <span style={{ padding: '0.5rem 1rem', background: 'var(--primary-glow)', borderRadius: '20px', fontWeight: 'bold' }}>Total: {bookings.length}</span>
                                            <button onClick={() => handleCreate('bookings')} className="btn-primary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '20px' }}><Plus size={16} /> Create Booking</button>
                                        </div>
                                    </div>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                                <th style={{ padding: '1rem' }}>ID</th>
                                                <th style={{ padding: '1rem' }}>Property ID</th>
                                                <th style={{ padding: '1rem' }}>Dates</th>
                                                <th style={{ padding: '1rem' }}>Status</th>
                                                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookings.map(b => (
                                                <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '1rem', opacity: 0.7 }}>#{b.id}</td>
                                                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>Property #{b.propertyId}</td>
                                                    <td style={{ padding: '1rem' }}>{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '10px', fontSize: '0.8rem', background: b.status === 'Confirmed' ? 'rgba(0,255,0,0.2)' : b.status === 'Pending' ? 'rgba(255,255,0,0.2)' : 'rgba(255,0,0,0.2)' }}>
                                                            {b.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                                        {b.status === 'Pending' && (
                                                            <>
                                                                <button onClick={() => handleUpdateBookingStatus(b.id, 'approve')} style={{ padding: '0.2rem 0.5rem', background: '#28a745', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Approve</button>
                                                                <button onClick={() => handleUpdateBookingStatus(b.id, 'reject')} style={{ padding: '0.2rem 0.5rem', background: '#dc3545', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>Reject</button>
                                                            </>
                                                        )}
                                                        <button onClick={() => handleEdit('bookings', b.id)} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', marginLeft: '0.5rem' }}><Edit size={18} /></button>
                                                        <button onClick={() => handleDelete('bookings', b.id)} style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                        </div>
                    )}
                </main>
            </div>

            {/* Modal */}
            {modalConfig.isOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-card" style={{ padding: '2rem', width: '400px', maxWidth: '90%' }}>
                        <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>{modalConfig.mode === 'create' ? 'Create' : 'Edit'} {modalConfig.type}</h3>
                        <form onSubmit={handleModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {modalConfig.type === 'properties' && (
                                <>
                                    <input placeholder="Title" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--card-border)', background: 'var(--background)', color: 'var(--foreground)' }} required />
                                    <input placeholder="Description" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--card-border)', background: 'var(--background)', color: 'var(--foreground)' }} required />
                                    <input placeholder="Address" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--card-border)', background: 'var(--background)', color: 'var(--foreground)' }} required />
                                    <input type="number" placeholder="Price" value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--card-border)', background: 'var(--background)', color: 'var(--foreground)' }} required />
                                    <input placeholder="Property Type" value={formData.propertyType || ''} onChange={e => setFormData({...formData, propertyType: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--card-border)', background: 'var(--background)', color: 'var(--foreground)' }} required />
                                    <input type="number" placeholder="Bedrooms" value={formData.bedrooms || ''} onChange={e => setFormData({...formData, bedrooms: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--card-border)', background: 'var(--background)', color: 'var(--foreground)' }} required />
                                    <input type="number" placeholder="Bathrooms" value={formData.bathrooms || ''} onChange={e => setFormData({...formData, bathrooms: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--card-border)', background: 'var(--background)', color: 'var(--foreground)' }} required />
                                </>
                            )}
                            {modalConfig.type === 'bookings' && (
                                <>
                                    <input type="number" placeholder="Property ID" value={formData.propertyId || ''} onChange={e => setFormData({...formData, propertyId: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--card-border)', background: 'var(--background)', color: 'var(--foreground)' }} required />
                                    <input type="date" placeholder="Start Date" value={formData.startDate ? formData.startDate.split('T')[0] : ''} onChange={e => setFormData({...formData, startDate: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--card-border)', background: 'var(--background)', color: 'var(--foreground)' }} required />
                                    <input type="date" placeholder="End Date" value={formData.endDate ? formData.endDate.split('T')[0] : ''} onChange={e => setFormData({...formData, endDate: e.target.value})} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--card-border)', background: 'var(--background)', color: 'var(--foreground)' }} required />
                                </>
                            )}
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: '20px', flex: 1, border: 'none', fontWeight: 'bold' }}>Save</button>
                                <button type="button" onClick={() => setModalConfig({ isOpen: false, type: '', mode: '', id: null })} style={{ padding: '0.5rem 1rem', borderRadius: '20px', background: 'var(--card-border)', color: 'var(--foreground)', border: 'none', flex: 1, cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
