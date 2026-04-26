"use client";

import React, { useEffect, useState } from 'react';
import { Search, Home, MapPin, DollarSign, Bed, Bath, User, X } from 'lucide-react';
import axios from 'axios';

interface Property {
  id: number;
  title: string;
  description: string;
  address: string;
  price: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  ownerId: number;
}

export default function AppDashboard() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("Tenant");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  const [bookingPropertyId, setBookingPropertyId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7249/api";

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await axios.get(`${API_URL}/Property`);
        setProperties(res.data);
      } catch (error) {
        console.error("Failed to fetch properties", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, [API_URL]);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (token) {
        setIsLoggedIn(true);
        try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          const roleData = decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
          setUserRole(roleData);
        } catch (e) {
          console.error("Failed to parse token", e);
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    };
    checkAuth();
  }, [authSuccess]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUserRole(null);
  };

  const filteredProperties = properties.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    try {
      if (authMode === "login") {
        const res = await axios.post(`${API_URL}/Auth/login`, { email, password });
        setAuthSuccess("Login successful!");
        localStorage.setItem("token", res.data.token);
        setTimeout(() => setShowAuthModal(false), 1500);
      } else {
        await axios.post(`${API_URL}/Auth/register`, { email, password, name, role });
        setAuthSuccess("Registration successful! Please login.");
        setTimeout(() => setAuthMode("login"), 1500);
      }
    } catch (err: any) {
      setAuthError(typeof err.response?.data === 'string' ? err.response.data : "Authentication failed");
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to book.");
      return;
    }

    try {
      await axios.post(`${API_URL}/Booking`, {
        propertyId: bookingPropertyId,
        startDate,
        endDate
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Booking request submitted successfully! Pending owner approval.");
      setBookingPropertyId(null);
    } catch (err: any) {
      alert(err.response?.data || "Failed to submit booking.");
    }
  };

  return (
    <div className="premium-gradient" style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
      <nav className="glass-nav" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 'bold', fontSize: '1.25rem' }}>
          <Home color="var(--primary)" size={28} />
          <span>Lucid<span style={{ color: "var(--primary)" }}>Estates</span></span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {isLoggedIn ? (
            <>
              {(userRole === 'Admin' || userRole === 'Owner') && (
                <a href="/admin" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--foreground)', textDecoration: 'none', boxShadow: 'none' }}>
                  {userRole === 'Owner' ? 'Owner Dashboard' : 'Admin Panel'}
                </a>
              )}
              <button onClick={handleLogout} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,0,0,0.1)', color: '#ff4d4d', boxShadow: 'none' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => { setAuthMode('login'); setShowAuthModal(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid var(--primary)', color: 'var(--foreground)', boxShadow: 'none' }}>
                Sign In
              </button>
              <button onClick={() => { setAuthMode('register'); setShowAuthModal(true); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={18} /> Sign Up
              </button>
            </>
          )}
        </div>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <header className="animated-fade-in" style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '2rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', lineHeight: '1.2' }}>
            Find Your Next <br /> <span style={{ color: "var(--primary)" }}>Dream Home</span>
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.8, maxWidth: '600px', margin: '0 auto' }}>
            Discover the most premium rental properties with beautiful designs and affordable prices.
          </p>

          <div className="glass-card" style={{ maxWidth: '600px', margin: '2rem auto 0', padding: '0.5rem', display: 'flex', borderRadius: '50px' }}>
            <div style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', color: 'gray' }}>
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search by location or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '0.75rem', fontSize: '1rem', color: 'var(--foreground)' }}
            />
            <button className="btn-primary" style={{ borderRadius: '40px', padding: '0.75rem 2rem' }}>
              Search
            </button>
          </div>
        </header>

        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Featured Properties</h2>
            <span style={{ opacity: 0.6 }}>{filteredProperties.length} results</span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>Loading premium estates...</div>
          ) : filteredProperties.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>No properties found. Allow the backend to be populated.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
              {filteredProperties.map((property, i) => (
                <div key={property.id} className="glass-card animated-fade-in" style={{ animationDelay: `${i * 0.1}s`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  <div style={{ height: '200px', background: 'linear-gradient(45deg, #1f1f1f, #333)', position: 'relative' }}>
                    <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'var(--primary)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      {property.propertyType || "Villa"}
                    </div>
                  </div>
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0 }}>{property.title}</h3>
                      <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>${property.price}<span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{property.propertyType === 'Apartment' ? '/mo' : ''}</span></span>
                    </div>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: 0.6, fontSize: '0.9rem', marginBottom: '1rem' }}>
                      <MapPin size={14} /> {property.address}
                    </p>
                    <p style={{ opacity: 0.8, fontSize: '0.95rem', marginBottom: '1.5rem', flex: 1, textOverflow: 'ellipsis', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {property.description}
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--card-border)', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', opacity: 0.8 }}>
                          <Bed size={16} color="var(--primary)" /> {property.bedrooms} Beds
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', opacity: 0.8 }}>
                          <Bath size={16} color="var(--primary)" /> {property.bathrooms} Baths
                        </div>
                      </div>

                      {isLoggedIn && (userRole === 'Tenant' || userRole === 'Renter') && (
                        <button onClick={() => setBookingPropertyId(property.id)} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                          Book Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
          <div className="glass-card animated-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setShowAuthModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--foreground)' }}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>
              {authMode === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h2>
            {authError && <p style={{ color: '#ff4d4d', textAlign: 'center', marginBottom: '1rem' }}>{authError}</p>}
            {authSuccess && <p style={{ color: '#4dff4d', textAlign: 'center', marginBottom: '1rem' }}>{authSuccess}</p>}
            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {authMode === 'register' && (
                <>
                  <input type="text" placeholder="Full Name" required value={name} onChange={e => setName(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--background)', color: 'var(--foreground)' }} />
                  <select value={role} onChange={e => setRole(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--background)', color: 'var(--foreground)' }}>
                    <option value="Tenant">Tenant</option>
                    <option value="Owner">Owner</option>
                  </select>
                </>
              )}
              <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--background)', color: 'var(--foreground)' }} />
              <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--background)', color: 'var(--foreground)' }} />
              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                {authMode === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.9rem', opacity: 0.8 }}>
              {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <b style={{ color: 'var(--primary)', cursor: 'pointer' }} onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(""); setAuthSuccess(""); }}>
                {authMode === 'login' ? 'Sign Up' : 'Sign In'}
              </b>
            </p>
          </div>
        </div>
      )}

      {bookingPropertyId !== null && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)' }}>
          <div className="glass-card animated-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setBookingPropertyId(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--foreground)' }}>
              <X size={24} />
            </button>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center' }}>
              Book Property
            </h2>
            <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>Check-in Date</label>
                <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--background)', color: 'var(--foreground)', width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>Check-out Date</label>
                <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--background)', color: 'var(--foreground)', width: '100%', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                Confirm Booking Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
