import React, { useState, useCallback } from 'react';
import { Table, Input, Button, Space, Modal, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { DynamicForm } from './DynamicForm';

const fetchData = async (endpoint) => {
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

const apiHandler = async (endpoint, options = {}) => {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  if (!response.ok) {
    throw new Error('API request failed');
  }
  return response.json();
};

export const DynamicTable = ({ config }) => {
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const queryClient = useQueryClient();
  
  const endpoint = config.table?.endpoint || config.endpoint;

  const { data = [], isLoading, error } = useQuery(
    ['table', endpoint],
    () => fetchData(endpoint),
    {
      refetchOnWindowFocus: false,
      retry: 1,
      onError: (error) => {
        message.error(`Failed to fetch data: ${error.message}`);
      }
    }
  );

  const handleMutationSuccess = useCallback(() => {
    queryClient.invalidateQueries(['table', endpoint]);
    setModalVisible(false);
    setEditRecord(null);
  }, [queryClient, endpoint]);

  const createMutation = useMutation(
    (values) => apiHandler(endpoint, {
      method: 'POST',
      body: JSON.stringify(values)
    }),
    {
      onSuccess: () => {
        handleMutationSuccess();
        message.success('Record created successfully');
      },
      onError: (error) => {
        message.error(`Failed to create record: ${error.message}`);
      }
    }
  );

  const updateMutation = useMutation(
    ({ id, values }) => apiHandler(endpoint, {
      method: 'PUT',
      body: JSON.stringify({ ...values, id })
    }),
    {
      onSuccess: () => {
        handleMutationSuccess();
        message.success('Record updated successfully');
      },
      onError: (error) => {
        message.error(`Failed to update record: ${error.message}`);
      }
    }
  );

  const deleteMutation = useMutation(
    (id) => apiHandler(`${endpoint}?id=${id}`, { method: 'DELETE' }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['table', endpoint]);
        message.success('Record deleted successfully');
      },
      onError: (error) => {
        message.error(`Failed to delete record: ${error.message}`);
      }
    }
  );

  const handleSubmit = (values) => {
    if (editRecord) {
      updateMutation.mutate({ id: editRecord.id, values });
    } else {
      createMutation.mutate(values);
    }
  };

  const columns = config.table?.columns || config.columns || [];
  const tableColumns = [
    ...columns.map(col => ({
      ...col,
      dataIndex: col.key,
      sorter: col.sorter ? (a, b) => {
        if (typeof a[col.key] === 'string') {
          return a[col.key]?.localeCompare(b[col.key]);
        }
        return (a[col.key] || 0) - (b[col.key] || 0);
      } : false,
      filteredValue: col.search ? [searchText] : null,
      onFilter: col.search ? (value, record) =>
        String(record[col.key]).toLowerCase().includes(value.toLowerCase()) : null,
      render: (text, record) => {
        if (col.type === 'currency') {
          return new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD' 
          }).format(text || 0);
        }
        if (col.type === 'date') {
          return text ? new Date(text).toLocaleDateString() : '-';
        }
        return text || '-';
      }
    })),
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditRecord(record);
              setModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => {
              Modal.confirm({
                title: 'Delete Record',
                content: 'Are you sure you want to delete this record?',
                onOk: () => deleteMutation.mutate(record.id)
              });
            }}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  if (error) {
    return <div>Error loading data: {error.message}</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Input
          placeholder="Search..."
          prefix={<SearchOutlined />}
          onChange={e => setSearchText(e.target.value)}
          style={{ width: 200 }}
          allowClear
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditRecord(null);
            setModalVisible(true);
          }}
        >
          Add New
        </Button>
      </div>
      <Table
        columns={tableColumns}
        dataSource={data}
        loading={isLoading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`
        }}
      />
      <Modal
        title={editRecord ? 'Edit Record' : 'Add New Record'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditRecord(null);
        }}
        footer={null}
        destroyOnClose
      >
        <DynamicForm
          fields={config.form?.fields || columns}
          initialValues={editRecord}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalVisible(false);
            setEditRecord(null);
          }}
        />
      </Modal>
    </div>
  );
}