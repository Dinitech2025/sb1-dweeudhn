import React from 'react';
    import { BrowserRouter as Router } from 'react-router-dom';
    import { Layout } from './components/Layout';
    import { AuthProvider } from './components/auth/AuthProvider';
    
    function App() {
      return (
        <Router>
          <AuthProvider>
            <Layout />
          </AuthProvider>
        </Router>
      );
    }
    
    export default App;
