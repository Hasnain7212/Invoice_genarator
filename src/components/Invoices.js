import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { fetchInvoices, createInvoice, fetchInventory } from '../utils/api';

const { Option } = Select;

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [inventory, setInventory] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invoicesRes, inventoryRes] = await Promise.all([
        fetchInvoices(),
        fetchInventory()
      ]);
      // Ensure we're setting arrays even if the response is malformed
      setInvoices(Array.isArray(invoicesRes.data) ? invoicesRes.data : []);
      setInventory(Array.isArray(inventoryRes.data) ? inventoryRes.data : []);
    } catch (error) {
      console.error('Failed to load data:', error);
      message.error('Failed to load data');
      // Set empty arrays on error to prevent undefined errors
      setInvoices([]);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Invoice #', dataIndex: 'invoice_number', key: 'invoice_number' },
    { title: 'Customer', dataIndex: 'customer_name', key: 'customer_name' },
    { 
      title: 'Amount', 
      dataIndex: 'total_amount', 
      key: 'total_amount',
      render: value => `$${(value || 0).toFixed(2)}`
    },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Status', dataIndex: 'status', key: 'status' }
  ];

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await createInvoice(values);
      setModalVisible(false);
      message.success('Invoice created successfully');
      loadData();
      form.resetFields();
    } catch (error) {
      console.error('Failed to create invoice:', error);
      message.error('Failed to create invoice');
    }
  };

  return (
    <div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() => setModalVisible(true)}
        style={{ marginBottom: 16 }}
      >
        Create Invoice
      </Button>

      <Table
        columns={columns}
        dataSource={invoices || []}
        loading={loading}
        rowKey={record => record.id || Math.random().toString()}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} invoices`
        }}
      />

      <Modal
        title="Create New Invoice"
        open={modalVisible}
        onOk={handleCreate}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="customer_name"
            label="Customer Name"
            rules={[{ required: true, message: 'Please input customer name!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(field => (
                  <div key={field.key} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <Form.Item
                      {...field}
                      label="Item"
                      name={[field.name, 'item_id']}
                      rules={[{ required: true, message: 'Please select an item!' }]}
                    >
                      <Select style={{ width: 200 }}>
                        {Array.isArray(inventory) && inventory.map(item => (
                          <Option key={item.id} value={item.id}>
                            {item.name} (${(item.price || 0).toFixed(2)})
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    
                    <Form.Item
                      {...field}
                      label="Quantity"
                      name={[field.name, 'quantity']}
                      rules={[{ required: true, message: 'Please input quantity!' }]}
                    >
                      <InputNumber min={1} />
                    </Form.Item>
                    
                    <Button onClick={() => remove(field.name)} type="link" danger>
                      Remove
                    </Button>
                  </div>
                ))}
                
                <Button type="dashed" onClick={() => add()} block>
                  Add Item
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}