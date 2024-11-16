// src/components/common/DataTable.jsx
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
  import { Button } from '@/components/ui/button';
  import { useState } from 'react';
  
  export const DataTable = ({ 
    columns, 
    data, 
    loading,
    onEdit,
    onDelete,
    actions = true 
  }) => {
    const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  
    const handleSort = (key) => {
      let direction = 'asc';
      if (sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
      }
      setSortConfig({ key, direction });
    };
  
    const sortedData = [...data].sort((a, b) => {
      if (!sortConfig.key) return 0;
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      return (
        (aVal > bVal ? 1 : -1) * (sortConfig.direction === 'asc' ? 1 : -1)
      );
    });
  
    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(({ key, title }) => (
              <TableHead 
                key={key}
                onClick={() => handleSort(key)}
                className="cursor-pointer"
              >
                {title}
              </TableHead>
            ))}
            {actions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length + (actions ? 1 : 0)}>
                <div className="flex justify-center py-4">
                  Loading...
                </div>
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((row) => (
              <TableRow key={row.id}>
                {columns.map(({ key, render }) => (
                  <TableCell key={key}>
                    {render ? render(row[key], row) : row[key]}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(row)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(row.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    );
  };
  