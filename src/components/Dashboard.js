// src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table } from 'antd';
import { DollarOutlined, ShoppingOutlined, FileTextOutlined } from '@ant-design/icons';
import { fetchDashboardStats } from '../utils/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalInventory: 0,
    pendingInvoices: 0,
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const { data } = await fetchDashboardStats();
      setStats({
        totalSales: data.totalSales || 0,
        totalInventory: data.totalInventory || 0,
        pendingInvoices: data.pendingInvoices || 0,
        recentTransactions: Array.isArray(data.recentTransactions) ? data.recentTransactions : []
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      setStats({
        totalSales: 0,
        totalInventory: 0,
        pendingInvoices: 0,
        recentTransactions: []
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      title: 'Invoice #', 
      dataIndex: 'invoice_number', 
      key: 'invoice_number' 
    },
    { 
      title: 'Amount', 
      dataIndex: 'total_amount', 
      key: 'total_amount',
      render: value => `$${(value || 0).toLocaleString()}`
    },
    { 
      title: 'Date', 
      dataIndex: 'date', 
      key: 'date' 
    }
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Sales"
              value={stats.totalSales}
              prefix={<DollarOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Inventory"
              value={stats.totalInventory}
              prefix={<ShoppingOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Pending Invoices"
              value={stats.pendingInvoices}
              prefix={<FileTextOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>
      
      <Card title="Recent Transactions" style={{ marginTop: 24 }}>
        <Table
          dataSource={stats.recentTransactions || []}
          columns={columns}
          loading={loading}
          pagination={false}
          rowKey={record => record.invoice_number || Math.random().toString()}
        />
      </Card>
    </div>
  );
}