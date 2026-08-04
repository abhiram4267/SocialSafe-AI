import React from 'react';
import { NavLink } from 'react-router-dom';
import { Zap, Users, ShieldAlert, LogOut, UserX  } from 'lucide-react';

const Sidebar = ({ onLogout }) => {
  return (
    <div style={styles.sidebar}>
      <h2 style={styles.logo}>SocialSafe-AI</h2>
      
      <NavLink to="/dashboard" style={({ isActive }) => isActive ? styles.navItemActive : styles.navItem}>
        <Zap size={20} /> Overview
      </NavLink>

      <NavLink to="/users" style={({ isActive }) => isActive ? styles.navItemActive : styles.navItem}>
        <Users size={20} /> Users
      </NavLink>

      <NavLink to="/surveillance" style={({ isActive }) => isActive ? styles.navItemActive : styles.navItem}>
        <ShieldAlert size={20} /> Surveillance
      </NavLink>

      <NavLink to="/blocked-users" style={({ isActive }) => isActive ? styles.navItemActive : styles.navItem}>
        <UserX size={20} /> Blocked Users
      </NavLink>

      <div style={{ flex: 1 }} /> {/* Pushes logout to bottom */}
      
      <button onClick={onLogout} style={styles.logoutBtn}>
        <LogOut size={20} /> Logout
      </button>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '280px',
    minWidth: '280px',
    backgroundColor: '#0f172a',
    color: 'white',
    padding: '30px 20px',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
  },
  logo: { color: '#6366f1', marginBottom: '40px', fontSize: '22px', fontWeight: 'bold', textAlign: 'center' },
  navItem: { display: 'flex', gap: '10px', padding: '12px', color: '#94a3b8', marginBottom: '10px', textDecoration: 'none', borderRadius: '8px' },
  navItemActive: { display: 'flex', gap: '10px', padding: '12px', backgroundColor: '#1e293b', borderRadius: '8px', marginBottom: '10px', color: '#6366f1', textDecoration: 'none', fontWeight: 'bold' },
  logoutBtn: { 
    display: 'flex', gap: '10px', padding: '12px', color: '#ef4444', 
    backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
    width: '100%', textAlign: 'left', borderRadius: '8px'
  }
};

export default Sidebar;