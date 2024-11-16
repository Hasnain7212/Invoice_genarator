import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from 'react-query';
import * as Icons from '@ant-design/icons';
import metadata from './metadata.json';
import { DynamicTable, DynamicForm, DynamicChart, DynamicNav } from './components';

const queryClient = new QueryClient();
const { Header, Sider, Content } = Layout;

const createModuleComponent = ({ table, form, charts }) => ({
  list: () => <DynamicTable {...table} />,
  form: () => <DynamicForm {...form} />,
  dashboard: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {charts?.map(chart => <DynamicChart key={chart.key} {...chart} />)}
    </div>
  )
});

export const ModuleComponent = ({ moduleKey, config }) => {
  if (!config) return null;

  switch (config.defaultView || 'list') {
    case 'list':
      return <DynamicTable config={config} />;
    // Add other view types here
    default:
      return null;
  }
};

const AppRoutes = () => (
  <Routes>
    {metadata.app.navigation.items.map(({ path, key }) => {
      const moduleConfig = metadata.modules[key];
      return (
        <Route 
          key={path} 
          path={path} 
          element={<ModuleComponent moduleKey={key} config={moduleConfig} />} 
        />
      );
    })}
  </Routes>
);

export default () => (
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
