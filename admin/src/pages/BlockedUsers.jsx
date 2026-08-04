import React, { useState, useEffect } from 'react';
import { blockUserAPI } from '../api';
import { Search, UserCheck, UserMinus, Mail, Phone, UserX } from 'lucide-react';

const BlockedUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await blockUserAPI();
    setUsers(data);
    setLoading(false);
  };

  // Filter logic for the search bar
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone?.includes(searchQuery)
  );

  if (loading) return <div style={styles.loading}>Loading User Directory...</div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>User Management</h1>
          <p style={styles.subtitle}>Total registered accounts: {users.length}</p>
        </div>
        
        {/* Search Bar */}
        <div style={styles.searchContainer}>
          <Search size={18} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search by name, username or phone..." 
            style={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      <div style={styles.tableCard} className="hide-scrollbar">
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>User Details</th>
              <th style={styles.th}>Contact Information</th>
              <th style={styles.th}>Account Blocked</th>
              <th style={styles.th}>Blocked reason</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} style={styles.tr}>
                {/* User Identity */}
                <td style={styles.td}>
                  <div style={styles.userCell}>
                    <div style={styles.avatar}>
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <div style={styles.userName}>{user.name || "No Name Set"}</div>
                      <div style={styles.userHandle}>@{user.username}</div>
                    </div>
                  </div>
                </td>

                {/* Contact Info */}
                <td style={styles.td}>
                  <div style={styles.iconInfo}><Mail size={14} /> {user.email}</div>
                  <div style={styles.iconInfo}><Phone size={14} /> {user.phone || "No Phone"}</div>
                </td>

                {/* Date */}
                <td style={styles.td}>
                  <div style={styles.dateText}>{user.blocked_at}</div>
                </td>

                <td style={styles.td}>
                  <div style={styles.dateText}>{user.block_reason || "No reason provided"}</div>
                </td>

                {/* Status Pill */}
                <td style={styles.td}>
                  <span style={styles.blockedPill}>
                    <UserX size={12} style={{marginRight: 4}} /> Blocked
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredUsers.length === 0 && (
          <div style={styles.emptyState}>No users found matching "{searchQuery}"</div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { animation: 'fadeIn 0.5s ease-in' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', fontSize: '18px', color: '#6366f1' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  title: { fontSize: '26px', fontWeight: 'bold', color: '#1e293b', margin: 0 },
  subtitle: { color: '#64748b', marginTop: '5px' },
  searchContainer: { display: 'flex', alignItems: 'center', backgroundColor: 'white', padding: '10px 15px', borderRadius: '10px', border: '1px solid #e2e8f0', width: '350px' },
  searchInput: { border: 'none', outline: 'none', marginLeft: '10px', width: '100%', fontSize: '14px' },
  tableCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
    width: '100%', // 🚨 Takes 100% of the container
    overflowX: 'auto', // Allows horizontal scroll only on small screens
    marginTop: '20px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: { textAlign: 'left', padding: '15px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' },
  td: { padding: '15px 20px', borderBottom: '1px solid #f1f5f9' },
  userCell: { display: 'flex', alignItems: 'center', gap: '15px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#6366f1', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' },
  userName: { fontWeight: '600', color: '#1e293b', fontSize: '15px' },
  userHandle: { color: '#64748b', fontSize: '13px' },
  iconInfo: { display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '13px', marginTop: '4px' },
  dateText: { color: '#475569', fontSize: '14px' },
  blockedPill: { display: 'inline-flex', alignItems: 'center', backgroundColor: '#df2323', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  emptyState: { padding: '40px', textAlign: 'center', color: '#94a3b8' }
};

export default BlockedUsersPage;