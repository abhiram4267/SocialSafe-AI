import React, { useState, useEffect } from 'react';
import { getDashboardData } from '../api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, ShieldAlert, Zap, MessageSquare } from 'lucide-react';

import TrendChart from '../components/TrendChart';

const COLORS = ['#6366f1', '#f59e0b', '#ef4444'];

const Dashboard = () => {
  const [data, setData] = useState(null);

  const loadData = async () => {
    const res = await getDashboardData();
    if (res) {
      setData(res);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div style={styles.loading}>Loading SocialSafe-AI Statistics...</div>;

  return (
    <div style={styles.container}>
      {/* Main Content */}
      <div style={styles.main}>
        <header style={styles.header}>
          <h1>Admin Dashboard</h1>
          <p>Real-time Multimodal Harassment Detection</p>
        </header>

        {/* 4 Stats Cards */}
        <div style={styles.grid4}>
          <Card title="Total Users" value={data.totalUsers} icon={<Users color="white"/>} color="#6366f1" />
          <Card title="Scanned Items" value={data.totalMessages} icon={<MessageSquare color="white"/>} color="#10b981" />
          <Card title="AI Accuracy" value={data.accuracy} icon={<Zap color="white"/>} color="#f59e0b" />
          <Card title="Threats Caught" value={data.threatCount} icon={<ShieldAlert color="white"/>} color="#ef4444" />
        </div>


        {/* Trend Chart */}
        <TrendChart />


        <div style={styles.grid2}>
          {/* Pie Chart */}
          <div style={styles.chartCard}>
            <h3 style={styles.cardHeading}>Threat Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie 
                  data={data.pieData} 
                  innerRadius={60} 
                  outerRadius={80} 
                  paddingAngle={5} 
                  dataKey="value"
                  nameKey="name"
                >
                  {data.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
              {data.pieData.map((entry, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', backgroundColor: COLORS[index % COLORS.length] }} />
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* User Table */}
          <div style={styles.chartCard}>
            <h3 style={styles.cardHeading}>Recent Activity Logs</h3>
            <div style={styles.tableContainer} className="hide-scrollbar">
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>User</th>
                    <th style={styles.th}>Message Content</th>
                    <th style={styles.th}>AI Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentLogs.map((log) => (
                    <tr key={log.id} style={styles.tr}>
                      <td style={styles.td}>{log.user}</td>
                      <td style={styles.td}>{log.text}</td>
                      <td style={styles.td}>
                        {/* 🚨 FIX: Matches "Safe" or "Safe Image" */}
                        <span style={log.prediction.toLowerCase().includes('safe') ? styles.safePill : styles.warnPill}>
                          {log.prediction}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Card Component
const Card = ({ title, value, icon, color }) => (
  <div style={styles.card}>
    <div>
      <p style={styles.cardTitle}>{title}</p>
      <h2 style={styles.cardValue}>{value}</h2>
    </div>
    <div style={{...styles.iconCircle, backgroundColor: color}}>{icon}</div>
  </div>
);

const styles = {
  container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' },
  loading: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '20px' },
  sidebar: { width: '260px', backgroundColor: '#0f172a', color: 'white', padding: '20px' },
  logo: { color: '#6366f1', marginBottom: '40px', fontSize: '22px' },
  navItemActive: { display: 'flex', gap: '10px', padding: '12px', backgroundColor: '#1e293b', borderRadius: '8px', marginBottom: '10px', color: '#6366f1', fontWeight: 'bold' },
  navItem: { display: 'flex', gap: '10px', padding: '12px', color: '#94a3b8', marginBottom: '10px' },
  main: { flex: 1, padding: '30px', overflowY: 'auto' },
  header: { marginBottom: '30px', linearGradient: 'to right, #6366f1, #10b981', color: '#1e293b', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px' },
  card: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' },
  cardTitle: { color: '#64748b', fontSize: '14px', margin: 0, textTransform: 'uppercase', fontWeight: '600' },
  cardValue: { fontSize: '32px', margin: '5px 0 0 0', fontWeight: 'bold', color: '#1e293b' },
  iconCircle: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  chartCard: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' },
  cardHeading: { fontSize: '18px', marginBottom: '20px', color: '#1e293b' },
  tableContainer: { maxHeight: '400px', overflowY: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '12px', borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' },
  td: { padding: '14px 12px', borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#334155' },
  safePill: { backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' },
  warnPill: { backgroundColor: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold' }
};

export default Dashboard;