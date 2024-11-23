import React, { useState, useEffect } from 'react';
import { Layout, Menu, theme, Typography } from 'antd';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import * as Icons from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const MainLayout = ({ config }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getIcon = (iconName) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent /> : null;
  };

  const { token } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        theme="light"
        collapsible
        collapsed={isMobile ? true : collapsed}
        onCollapse={setCollapsed}
        breakpoint="lg"
        collapsedWidth={isMobile ? 0 : 80}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          backgroundColor: token.colorBgContainer,
          boxShadow: token.boxShadowTertiary,
        }}
        zIndex={1001}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: token.colorPrimary,
          margin: '0 0 8px 0'
        }}>
          <Title level={4} style={{ margin: 0, color: token.colorWhite }}>
            {!collapsed && (config?.title || 'Business')}
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ borderRight: 0 }}
          items={config?.navigation?.items?.map(item => ({
            key: item.path,
            icon: getIcon(item.icon),
            label: item.label,
            onClick: () => navigate(item.path)
          }))}
        />
      </Sider>
      <Layout style={{ 
        marginLeft: isMobile ? 0 : (collapsed ? 80 : 200),
        transition: 'all 0.2s',
      }}>
        <Header style={{ 
          padding: '0 24px',
          background: token.colorBgContainer,
          boxShadow: token.boxShadowTertiary,
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          height: 64,
          display: 'flex',
          alignItems: 'center',
        }}>
          <Title level={4} style={{ margin: 0 }}>
            {config?.navigation?.items?.find(item => item.path === location.pathname)?.label || config?.title}
          </Title>
        </Header>
        <Content style={{ 
          margin: '24px 16px',
          padding: 24,
          minHeight: 280,
          borderRadius: token.borderRadiusLG,
          background: token.colorBgContainer,
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;