// DynamicModule.jsx
import React from 'react';
import { Layout } from 'antd';
import { DynamicNav, DynamicTable, DynamicForm } from './components';

const { Header, Content } = Layout;

export const DynamicModule = ({ config }) => {
  if (!config) return null;

  // Separate configurations for each component
  const navConfig = {
    items: config.navigation?.items || []
  };

  const tableConfig = {
    endpoint: config.table?.endpoint,
    columns: config.table?.columns || [],
    title: config.table?.title
  };

  const formConfig = {
    endpoint: config.form?.endpoint,
    fields: config.form?.fields || [],
    title: config.form?.title
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <DynamicNav {...navConfig} />
      <Layout>
        <Header style={{ background: '#fff', padding: 0 }} />
        <Content style={{ margin: '24px 16px' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ flex: 2 }}>
              <DynamicTable config={tableConfig} />
            </div>
            <div style={{ flex: 1 }}>
              <DynamicForm config={formConfig} />
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};