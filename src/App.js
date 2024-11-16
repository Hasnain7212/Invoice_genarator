import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from 'react-query';
import metadata from './metadata.json';
import { DynamicTable, DynamicNav } from './components';
import PropTypes from 'prop-types';

const queryClient = new QueryClient();
const { Header, Content } = Layout;

export const ModuleComponent = ({ config }) => {
  if (!config) return null;
 
  switch (config.defaultView || 'list') {
    case 'list':
      return <DynamicTable config={config} />;
    default:
      return null;
  }
};

ModuleComponent.propTypes = {
  config: PropTypes.shape({
    defaultView: PropTypes.string,
  }).isRequired,
};

const AppRoutes = () => (
  <Routes>
    {metadata.app.navigation.items.map(({ path, key }) => {
      const moduleConfig = metadata.modules[key];
      return (
        <Route 
          key={path} 
          path={path} 
          element={<ModuleComponent config={moduleConfig} />} 
        />
      );
    })}
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ConfigProvider>
      <Router>
        <Layout className="min-h-screen">
          <DynamicNav items={metadata.app.navigation.items} />
          <Layout>
            <Header className="bg-white p-0" />
            <Content className="m-4"><AppRoutes /></Content>
          </Layout>
        </Layout>
      </Router>
    </ConfigProvider>
  </QueryClientProvider>
);

export default App;
