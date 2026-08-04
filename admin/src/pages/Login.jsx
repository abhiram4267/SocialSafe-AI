import React, { useState } from 'react';
import { Lock, User, ShieldCheck } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
  // 1. DEFAULT CREDENTIALS (Can be updated later)
  const [adminUser] = useState("admin");
  const [adminPass] = useState("admin123");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === adminUser && password === adminPass) {
      onLogin(); // Trigger the login state change in App.jsx
    } else {
      setError("Invalid admin credentials. Please try again.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        <div style={styles.logoArea}>
          <ShieldCheck size={50} color="#6366f1" />
          <h2 style={styles.logoText}>SocialSafe-AI</h2>
          <p style={styles.subtitle}>Administrative Control Portal</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <User size={18} color="#94a3b8" style={styles.icon} />
            <input 
              type="text" 
              placeholder="Username" 
              style={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div style={styles.inputGroup}>
            <Lock size={18} color="#94a3b8" style={styles.icon} />
            <input 
              type="password" 
              placeholder="Password" 
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error ? <p style={styles.errorText}>{error}</p> : null}

          <button type="submit" style={styles.loginBtn}>
            Enter Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { height: '100vh', width: '100vw', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
  loginCard: { backgroundColor: 'white', padding: '40px', borderRadius: '20px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', textAlign: 'center' },
  logoArea: { marginBottom: '30px' },
  logoText: { fontSize: '24px', fontWeight: 'bold', color: '#1e293b', margin: '10px 0 5px 0' },
  subtitle: { color: '#64748b', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { position: 'relative', display: 'flex', alignItems: 'center' },
  icon: { position: 'absolute', left: '15px' },
  input: { width: '100%', padding: '12px 12px 12px 45px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '16px', outline: 'none' },
  loginBtn: { backgroundColor: '#6366f1', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },
  errorText: { color: '#ef4444', fontSize: '13px', margin: 0 }
};

export default LoginPage;