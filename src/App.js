import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, ConfigProvider, theme } from 'antd';
import { QueryClient, QueryClientProvider } from 'react-query';
import metadata from './metadata.json';
import { DynamicTable, DynamicNav } from './components';
import PropTypes from 'prop-types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const { Header, Content } = Layout;

const ModuleComponent = ({ config }) => {
  if (!config) return null;
  return <DynamicTable config={config.table || config} />;
};

ModuleComponent.propTypes = {
  config: PropTypes.object.isRequired,
};

const AppRoutes = () => (
  <Routes>
    {metadata.app.navigation.items.map(({ path, key }) => (
      <Route 
        key={path} 
        path={path} 
        element={<ModuleComponent config={metadata.modules[key]} />} 
      />
    ))}
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
      }}
    >
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <DynamicNav items={metadata.app.navigation.items} />
          <Layout>
            <Header style={{ background: '#fff', padding: 0 }} />
            <Content style={{ margin: '24px 16px' }}>
              <AppRoutes />
            </Content>
          </Layout>
        </Layout>
      </Router>
    </ConfigProvider>
  </QueryClientProvider>
);

export default App;