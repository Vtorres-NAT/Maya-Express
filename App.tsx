
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import OperationalHub from './components/OperationalHub';
import RealTimeTracking from './components/RealTimeTracking';
import ServiceOrders from './components/ServiceOrders';
import BillingCenter from './components/BillingCenter';
import FinanceScreen from './components/FinanceScreen';
import MasterData from './components/MasterData';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<ExecutiveDashboard />} />
          <Route path="/ops-hub" element={<OperationalHub />} />
          <Route path="/tracking" element={<RealTimeTracking />} />
          <Route path="/orders" element={<ServiceOrders />} />
          <Route path="/billing" element={<BillingCenter />} />
          <Route path="/finance" element={<FinanceScreen />} />
          <Route path="/data" element={<MasterData />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
