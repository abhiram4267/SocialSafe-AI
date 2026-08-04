import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFullConversation, reportUsersAPI  } from '../api';
import { ArrowLeft, ShieldCheck, ShieldAlert, User, Mic, Video as VideoIcon } from 'lucide-react';

import { BASE_URL } from '../api';

const MessageInfo = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [chat, setChat] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  //Model for reporting users
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [reporting, setReporting] = useState(false);

  // --- 🚀 THE IP-PROOF RESOLVER ---
  // --- 🚀 THE IP-PROOF RESOLVER ---
  const resolveUri = useCallback((path) => {
    if (!path) return '';

    // 1. Get the current root from your API file (e.g., http://172.28.158.247:8000)
    const currentRoot = BASE_URL.replace("/api/admin", "");

    // 2. 🚨 THE CORE FIX: If the path contains an old IP or is a full URL
    if (path.startsWith("http")) {
        // Find the folder structure that never changes: "/static/"
        const parts = path.split("/static/");
        if (parts.length > 1) {
            // Reconstruct: [New Current Root] + [The static file path]
            const finalUrl = `${currentRoot}/static/${parts[1]}`;
            // console.log("🔄 IP Swapped from old to:", finalUrl);
            return finalUrl;
        }
        return path; // Return as is if it's an external web link
    }
    
    // 3. Handle relative paths (e.g., "static/uploads/abc.jpg")
    // Fix Windows backslashes (\ to /) and remove leading slashes to prevent "8000//static"
    const cleanPath = path.replace(/\\/g, "/").replace(/^\/+/, "");
    return `${currentRoot}/${cleanPath}`;
  }, [BASE_URL]);

  useEffect(() => {
    if (state?.sender && state?.receiver) {
      getFullConversation(state.sender, state.receiver).then(res => {
        setChat(res.messages || []);      // Extract messages
        setParticipants(res.participants || []); // Extract participant info
        setLoading(false);
      });
    }
  }, [state]);

  const handleCheckboxChange = (user) => {
    setSelectedUsers(prev => 
      prev.includes(user) ? prev.filter(u => u !== user) : [...prev, user]
    );
  };

  const submitReport = async () => {
    if (selectedUsers.length === 0) return alert("Select at least one user.");
    
    setReporting(true);
    try {
      const results = await reportUsersAPI(selectedUsers);
      
      // Check if any user exceeded 5 warnings
      results.forEach(res => {
        if (res.exceeded_limit) {
          alert(`🚨 CRITICAL: ${res.username} has reached ${res.warning_count} warnings! Consider taking action.`);
        } else {
          alert(`Reported ${res.username}. Current warnings: ${res.warning_count}`);
        }
      });

      setIsModalOpen(false);
      setSelectedUsers([]);
    } catch (error) {
      alert("Failed to submit report.");
    } finally {
      setReporting(false);
    }
  };

  if (loading) return <div style={styles.loading}>Loading Full Conversation...</div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}><ArrowLeft size={20} /> Back</button>
        <div style={styles.headerTitle}>
          <User size={24} color="#6366f1" />
          <h2>Audit: {state.sender} ↔ {state.receiver}</h2>
        </div>
        <button onClick={() => setIsModalOpen(true)} style={styles.reportHeaderBtn}>Report Users</button>
      </header>

      {/* --- REPORT MODAL --- */}
      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ marginBottom: '5px' }}>Issue Security Warning</h3>
            <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '20px' }}>
                Verify identity and select the user to issue a warning.
            </p>

            {participants.map((user) => (
              <label key={user.username} style={selectedUsers.includes(user.username) ? styles.selectedCheckboxRow : styles.checkboxRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                        type="checkbox" 
                        checked={selectedUsers.includes(user.username)}
                        onChange={() => handleCheckboxChange(user.username)}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ fontSize: '15px', color: '#1e293b' }}>{user.username}</strong>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>✉️ {user.email}</span>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>📞 {user.phone}</span>
                    </div>
                </div>
              </label>
            ))}

            <div style={styles.modalActions}>
              <button onClick={() => setIsModalOpen(false)} style={styles.cancelBtn} disabled={reporting}>Cancel</button>
              <button onClick={submitReport} style={styles.confirmReportBtn} disabled={reporting}>
                {reporting ? "Processing..." : "Submit Report"}
              </button>
            </div>
          </div>
        </div>
      )}



      <div style={styles.chatArea} className="hide-scrollbar">
        {chat.map((msg) => (
          <div key={msg.id} style={msg.sender === state.sender ? styles.senderRow : styles.receiverRow}>
            <div style={styles.bubble}>
              <div style={styles.bubbleHeader}>
                <strong>{msg.sender}</strong>
                <span style={styles.time}>{msg.time}</span>
              </div>
              
              <div style={styles.body}>
                {/* 📝 TEXT CONTENT */}
                {msg.type === 'text' && <span>{msg.text}</span>}

                {/* 🖼️ IMAGE CONTENT */}
                {msg.type === 'image' && (
                    <img src={resolveUri(msg.text)} style={styles.media} alt="Evidence" />
                )}

                {/* 🎙️ AUDIO CONTENT */}
                {msg.type === 'audio' && (
                    <div style={styles.mediaPlayer}>
                        <div style={styles.iconLabel}><Mic size={14}/> Voice Note</div>
                        <audio controls src={resolveUri(msg.text)} style={styles.audio} />
                    </div>
                )}

                {/* 🎬 VIDEO CONTENT */}
                {msg.type === 'video' && (
                    <div style={styles.mediaPlayer}>
                        <div style={styles.iconLabel}><VideoIcon size={14}/> Video Evidence</div>
                        <video controls src={resolveUri(msg.text)} style={styles.video} />
                    </div>
                )}
              </div>

              {/* AI VERDICT FOOTER */}
              <div style={msg.prediction.toLowerCase().includes('safe') ? styles.safeTag : styles.dangerTag}>
                {msg.prediction.toLowerCase().includes('safe') ? <ShieldCheck size={12}/> : <ShieldAlert size={12}/>}
                <span>AI: {msg.prediction} ({msg.confidence})</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { height: '85vh', display: 'flex', flexDirection: 'column', backgroundColor: 'white', borderRadius: '15px', overflow: 'hidden', border: '1px solid #e2e8f0' },
  header: { padding: '15px 25px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '20px', backgroundColor: '#f8fafc' },
  headerTitle: { display: 'flex', alignItems: 'center', gap: '10px' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: 'bold' },
  chatArea: { flex: 1, padding: '25px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: '#f1f5f9' },
  senderRow: { alignSelf: 'flex-start', maxWidth: '75%' },
  receiverRow: { alignSelf: 'flex-end', maxWidth: '75%' },
  bubble: { backgroundColor: 'white', padding: '15px', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
  bubbleHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12px' },
  body: { fontSize: '15px', color: '#1e293b', marginBottom: '12px', lineHeight: '1.5' },
  media: { maxWidth: '100%', maxHeight: '300px', borderRadius: '10px', display: 'block' },
  video: { width: '100%', borderRadius: '10px', marginTop: '5px' },
  audio: { width: '100%', marginTop: '5px', height: '35px' },
  mediaPlayer: { backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px' },
  iconLabel: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#64748b', marginBottom: '5px', fontWeight: 'bold' },
  safeTag: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#15803d', backgroundColor: '#dcfce7', padding: '5px 10px', borderRadius: '6px', fontWeight: 'bold' },
  dangerTag: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#b91c1c', backgroundColor: '#fee2e2', padding: '5px 10px', borderRadius: '6px', fontWeight: 'bold' },
  time: { color: '#94a3b8' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#6366f1', fontWeight: 'bold' },
   reportHeaderBtn: { padding: '8px 16px', backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: 'white', padding: '30px', borderRadius: '15px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
  checkboxRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid #f1f5f9', borderRadius: '10px', marginBottom: '10px', cursor: 'pointer' },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '25px' },
  cancelBtn: { padding: '10px 20px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  confirmReportBtn: { padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  checkboxRow: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: '12px', 
    border: '1px solid #f1f5f9', 
    borderRadius: '10px', 
    marginBottom: '10px', 
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  selectedCheckboxRow: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: '12px', 
    border: '1px solid #6366f1', 
    backgroundColor: '#eef2ff',
    borderRadius: '10px', 
    marginBottom: '10px', 
    cursor: 'pointer' 
  },
};

export default MessageInfo;