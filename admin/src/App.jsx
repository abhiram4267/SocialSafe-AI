// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Sidebar from './components/Sidebar';
// import Overview from './pages/Overview';
// import UsersPage from './pages/users';
// import SurveillancePage from './pages/Surveillance';
// import MessageInfo from './pages/MessagesInfo';

// function App() {
//   return (
//     <Router>
//       <div style={styles.appWrapper}>
//         {/* Fixed Sidebar */}
//         <Sidebar />

//         {/* Dynamic Main Content */}
//         <main style={styles.mainContent}>
//           <div style={styles.pageContainer}>
//             <Routes>
//               <Route path="/dashboard" element={<Overview />} />
//               <Route path="/users" element={<UsersPage />} />
//               <Route path="/surveillance" element={<SurveillancePage />} />
//               <Route path="/message-info" element={<MessageInfo />} />
//             </Routes>
//           </div>
//         </main>
//       </div>
//     </Router>
//   );
// }

// const styles = {
//   appWrapper: {
//     display: 'flex',
//     width: '100vw',
//     height: '100vh',
//     overflow: 'hidden',
//   },
//   mainContent: {
//     flex: 1, // Takes 100% of the remaining width
//     height: '100vh',
//     overflowY: 'auto', // Only the content area scrolls
//     backgroundColor: '#f1f5f9',
//   },
//   pageContainer: {
//     padding: '40px', // Standard dashboard spacing
//     maxWidth: '1600px', // Prevents the UI from stretching too far on ultra-wide monitors
//     margin: '0 auto', // Centers the content
//     width: '100%',
//   }
// };

// export default App;



import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Overview from './pages/Overview';
import UsersPage from './pages/users';
import SurveillancePage from './pages/Surveillance';
import MessageInfo from './pages/MessagesInfo';
import LoginPage from './pages/login';
import BlockedUsersPage from './pages/BlockedUsers';

function App() {
  // 1. Manage Login State (Persist it in localStorage so refresh doesn't log you out)
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAdminAuth') === 'true'
  );

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAdminAuth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAdminAuth');
  };

  return (
    <Router>
      {!isAuthenticated ? (
        // 🚨 SHOW ONLY LOGIN IF NOT AUTHENTICATED
        <Routes>
          <Route path="*" element={<LoginPage onLogin={handleLoginSuccess} />} />
        </Routes>
      ) : (
        // ✅ SHOW DASHBOARD IF AUTHENTICATED
        <div style={styles.appWrapper}>
          <Sidebar onLogout={handleLogout} /> 
          
          <main style={styles.mainContent} className="hide-scrollbar">
            <div style={styles.pageContainer}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Overview />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/surveillance" element={<SurveillancePage />} />
                <Route path="/message-info" element={<MessageInfo />} />
                <Route path="/blocked-users" element={<BlockedUsersPage />} />
              </Routes>
            </div>
          </main>
        </div>
      )}
    </Router>
  );
}

const styles = {
    appWrapper: { display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' },
    mainContent: { flex: 1, height: '100vh', overflowY: 'auto', backgroundColor: '#f1f5f9' },
    pageContainer: { padding: '40px', maxWidth: '1600px', margin: '0 auto', width: '100%' }
};

export default App;