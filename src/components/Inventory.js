// src/components/Inventory.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { fetchInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } from '../utils/api';

export default function Inventory() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const response = await fetchInventory();
      console.log(response)
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to load inventory:', error);
      message.error('Failed to load inventory');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { 
      title: 'Price', 
      dataIndex: 'price', 
      key: 'price',
      render: value => `$${(value || 0).toFixed(2)}`
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            style={{ marginRight: 8 }}
          />
          <Button 
            icon={<DeleteOutlined />} 
            danger
            onClick={() => handleDelete(record.id)}
          />
        </>
      ),
    },
  ];

  const handleCreate = () => {
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setEditingId(record.id);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteInventoryItem(id);
      message.success('Item deleted successfully');
      loadInventory();
    } catch (error) {
      message.error('Failed to delete item');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await updateInventoryItem(editingId, values);
      } else {
        await addInventoryItem(values);
      }
      setModalVisible(false);
      message.success(`Item ${editingId ? 'updated' : 'added'} successfully`);
      loadInventory();
    } catch (error) {
      message.error(`Failed to ${editingId ? 'update' : 'add'} item`);
    }
  };

  return (
    <div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleCreate}
        style={{ marginBottom: 16 }}
      >
        Add Item
      </Button>
      
      <Table
        columns={columns}
        dataSource={data || []}
        loading={loading}
        rowKey={record => record.id || Math.random().toString()}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`
        }}
      />

      <Modal
        title={editingId ? 'Edit Item' : 'Add New Item'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Item Name"
            rules={[{ required: true, message: 'Please input item name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: 'Please input quantity!' }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please input price!' }]}
          >
            <InputNumber
              min={0}
              precision={2}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}