// src/components/Dashboard/index.jsx
import { useEffect, useState } from 'react';
import { StatCard } from '../common/StatCard';
import { fetchDashboardStats } from '../../utils/api';
import { 
  DollarSign, 
  Package, 
  FileText, 
  AlertTriangle 
} from 'lucide-react';

export const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await fetchDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const dashboardCards = [
    {
      title: 'Total Sales',
      value: `$${stats.totalSales?.toLocaleString() ?? 0}`,
      icon: <DollarSign />,
    },
    {
      title: 'Inventory Items',
      value: stats.totalInventory?.toLocaleString() ?? 0,
      icon: <Package />,
    },
    {
      title: 'Pending Invoices',
      value: stats.pendingInvoices?.toLocaleString() ?? 0,
      icon: <FileText />,
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStock?.toLocaleString() ?? 0,
      icon: <AlertTriangle />,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardCards.map((card) => (
          <StatCard key={card.title} loading={loading} {...card} />
        ))}
      </div>
    </div>
  );
};