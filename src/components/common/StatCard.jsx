// src/components/common/StatCard.jsx
import { Card, Skeleton } from '@/components/ui/card';

export const StatCard = ({ title, value, icon, loading }) => (
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </div>
      {icon && <div className="text-2xl text-gray-400">{icon}</div>}
    </div>
  </Card>
);