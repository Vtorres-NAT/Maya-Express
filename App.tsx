
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import OperationalHub from './components/OperationalHub';
import RealTimeTracking from './components/RealTimeTracking';
import ServiceOrders from './components/ServiceOrders';
import BillingCenter from './components/BillingCenter';
import FinanceScreen from './components/FinanceScreen';
import ClientsProviders from './components/ClientsProviders';
import MasterData from './components/MasterData';
import LoginPage from './components/LoginPage';
import LoadingScreen from './components/LoadingScreen';

const AuthenticatedApp: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ExecutiveDashboard />} />
        <Route path="/ops-hub" element={<OperationalHub />} />
        <Route path="/tracking" element={<RealTimeTracking />} />
        <Route path="/orders" element={<ServiceOrders />} />
        <Route path="/billing" element={<BillingCenter />} />
        <Route path="/finance" element={<FinanceScreen />} />
        <Route path="/clients-providers" element={<ClientsProviders />} />
        <Route path="/data" element={<MasterData />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <DataProvider>
          <AuthenticatedApp />
        </DataProvider>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;
