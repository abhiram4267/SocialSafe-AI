import React, { useState, useEffect } from 'react';
import { getUserTrendAPI } from '../api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const TrendChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('1week');

  const timeframes = [
    { label: 'Past Week', value: '1week' },
    { label: 'Past Month', value: '1month' },
    { label: 'Past Year', value: '1year' },
    { label: 'Complete Lifeline', value: 'lifeline' },
  ];

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getUserTrendAPI(period);

      if (response && response.labels && response.datasets) {
        // Transform the data
        const formattedData = response.labels.map((label, index) => ({
          name: label,
          registered: response.datasets[0].data[index] || 0,
          decreased: response.datasets[1].data[index] || 0,
        }));
        setData(formattedData);
      }
    } catch (error) {
      console.error("Error updating chart:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>User Activity Trend</h2>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>Growth analysis for selected timeline</p>
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={selectStyle}
        >
          {timeframes.map((tf) => (
            <option key={tf.value} value={tf.value}>{tf.label}</option>
          ))}
        </select>
      </div>

      {/* 🚨 FIX 1: Explicit style height instead of Tailwind h-[300px] */}
      <div style={{ height: 350, width: '100%' }}>
        {loading ? (
          <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <p>Loading Chart...</p>
          </div>
        ) : (
          /* 🚨 FIX 2: Added a key to force re-render when period changes */
          <ResponsiveContainer width="100%" height="100%" key={period}>
            <AreaChart 
              data={data} 
              /* 🚨 FIX 3: Added margins so the chart lines aren't cut off */
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                tick={{fontSize: 12, fill: '#64748b'}} 
                axisLine={false} 
                tickLine={false} 
                dy={10} 
              />
              <YAxis 
                tick={{fontSize: 12, fill: '#64748b'}} 
                axisLine={false} 
                tickLine={false} 
              />
              <Tooltip />
              <Legend verticalAlign="top" height={50}/>
              <Area 
                name="New Users" 
                type="monotone" 
                dataKey="registered" 
                stroke="#6366f1" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorReg)" 
              />
              {/* <Area 
                name="Decreased" 
                type="monotone" 
                dataKey="decreased" 
                stroke="#ef4444" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorDec)" 
              /> */}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

// Internal Styles (to ensure visibility without relying on Tailwind)
const cardStyle = {
  backgroundColor: 'white',
  padding: '24px',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  marginBottom: '30px',
  width: '100%',
  maxWidth: '900px',
  margin: '20px auto'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px'
};

const selectStyle = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  backgroundColor: '#f8fafc',
  fontSize: '14px',
  cursor: 'pointer'
};

export default TrendChart;