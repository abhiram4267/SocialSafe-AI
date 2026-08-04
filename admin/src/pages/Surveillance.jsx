import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFlaggedLogs } from '../api';
import { 
  ShieldAlert, 
  Clock, 
  ArrowRight,
  Search,
  History
} from 'lucide-react';

const SurveillancePage = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadLogs = async () => {
    const data = await getFlaggedLogs();
    
    // --- 🚀 DEDUPLICATION LOGIC (Group by User Pairs) ---
    const seenPairs = new Set();
    const uniqueThreads = data.filter(log => {
      // Sort names alphabetically to make (A->B) and (B->A) the same key
      const pairKey = [log.sender, log.receiver].sort().join("-");
      
      if (seenPairs.has(pairKey)) {
        return false; // Skip if we already have this pair
      }
      
      seenPairs.add(pairKey);
      return true; // Keep the first (most recent) one
    });

    setLogs(uniqueThreads);
    setLoading(false);
  };

  if (loading) return <div style={styles.loading}>Grouping Interaction Threads...</div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>🛡️ AI Surveillance Hub</h1>
          <p style={styles.subtitle}>Unique conversation threads flagged for review</p>
        </div>
        <div style={styles.badge}>
          <ShieldAlert size={18} />
          <span>{logs.length} Flagged Interactions</span>
        </div>
      </header>

      <div style={styles.tableCard} className="hide-scrollbar">
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Last Flagged</th>
              <th style={styles.th}>Interaction Pair</th>
              <th style={styles.th}>Most Recent Verdict</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={styles.tr}>
                {/* Time */}
                <td style={styles.td}>
                  <div style={styles.timeCell}>
                    <Clock size={14} color="#94a3b8" />
                    <span style={styles.timeText}>{log.time}</span>
                  </div>
                </td>

                {/* Sender <-> Receiver */}
                <td style={styles.td}>
                  <div style={styles.interactionCell}>
                    <div style={styles.userBadge}>{log.sender}</div>
                    <ArrowRight size={14} color="#6366f1" />
                    <div style={styles.userBadge}>{log.receiver}</div>
                  </div>
                </td>

                {/* AI Decision */}
                <td style={styles.td}>
                  <div style={log.prediction === 'Harassment' ? styles.harassPill : styles.attackPill}>
                    {log.prediction}
                  </div>
                </td>

                {/* Audit Button */}
                <td style={styles.td}>
                  <button 
                    style={styles.viewBtn} 
                    onClick={() => navigate('/message-info', { 
                        state: { sender: log.sender, receiver: log.receiver } 
                    })}
                  >
                    <History size={16} />
                    Audit Full Chat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div style={styles.emptyState}>
            <ShieldAlert size={40} color="#cbd5e1" />
            <p>No unique harassment threads found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { width: '100%', animation: 'fadeIn 0.4s ease-out' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontSize: '18px', color: '#6366f1', fontWeight: 'bold' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  title: { fontSize: '28px', fontWeight: 'bold', color: '#0f172a', margin: 0 },
  subtitle: { color: '#64748b', marginTop: '5px' },
  badge: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold' },
  tableCard: { backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden', width: '100%' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '15px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' },
  td: { padding: '20px', borderBottom: '1px solid #f1f5f9' },
  timeCell: { display: 'flex', alignItems: 'center', gap: '8px' },
  timeText: { fontSize: '13px', color: '#64748b' },
  interactionCell: { display: 'flex', alignItems: 'center', gap: '12px' },
  userBadge: { backgroundColor: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontWeight: '600', color: '#1e293b', fontSize: '14px' },
  harassPill: { display: 'inline-block', backgroundColor: '#fee2e2', color: '#b91c1c', padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #fecaca' },
  attackPill: { display: 'inline-block', backgroundColor: '#ffedd5', color: '#9a3412', padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', border: '1px solid #fed7aa' },
  viewBtn: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#6366f1', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', transition: '0.2s' },
  emptyState: { padding: '80px', textAlign: 'center', color: '#94a3b8' }
};

export default SurveillancePage;