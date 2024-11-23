import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, message, Space, Spin } from 'antd';
import { fetchAll, createItem, updateItem, deleteItem } from './api';
import config from '../config/appConfig.json';

const CrudModule = ({ module }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [relatedData, setRelatedData] = useState({});
  const [loadingRelated, setLoadingRelated] = useState({});
  const [form] = Form.useForm();
  const [editingRecord, setEditingRecord] = useState(null);

  const loadRelatedData = async (fieldKey, relationConfig) => {
    // Get the related module's configuration from the global config
    const relatedModuleConfig = config.modules[relationConfig.module];
    
    // If module doesn't exist in config, log error and return
    if (!relatedModuleConfig) {
      console.error(`Related module ${relationConfig.module} not found in configuration`);
      return;
    }

    setLoadingRelated(prev => ({ ...prev, [fieldKey]: true }));
    try {
      // Use the endpoint from the module's configuration
      const response = await fetchAll(relatedModuleConfig.endpoint);
      setRelatedData(prev => ({
        ...prev,
        [fieldKey]: response
      }));
    } catch (error) {
      message.error(`Failed to load ${relatedModuleConfig.title} data`);
      console.error(`Error loading related data for ${fieldKey}:`, error);
    } finally {
      setLoadingRelated(prev => ({ ...prev, [fieldKey]: false }));
    }
  };

  const loadAllRelatedData = useCallback(async () => {
    // Get all fields that have relations
    const relatedFields = module.form.fields.filter(field => field.relation);
    
    // Load data for each related field
    await Promise.all(
      relatedFields.map(field => loadRelatedData(field.key, field.relation))
    );
  }, [module]);

  useEffect(() => {
    if (module.form?.fields) {
      loadAllRelatedData();
    }
  }, [module, loadAllRelatedData]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchAll(module.endpoint);
      setData(response);
    } catch (error) {
      message.error('Failed to load data');
      console.error('Error loading main module data:', error);
    } finally {
      setLoading(false);
    }
  }, [module]);

  useEffect(() => {
    loadData();
  }, [module, loadData]);

  const handleSubmit = async (values) => {
    try {
      if (editingRecord) {
        await updateItem(module.endpoint, editingRecord.id, values);
        message.success('Item updated successfully');
      } else {
        await createItem(module.endpoint, values);
        message.success('Item created successfully');
      }
      await loadData();
      setModalVisible(false);
      form.resetFields();
      setEditingRecord(null);
    } catch (error) {
      message.error('Operation failed');
      console.error('Error submitting form:', error);
    }
  };

  const renderFormField = (field) => {
    switch (field.type) {
      case 'select':
      case 'multi-select':
        return (
          <Select
            mode={field.type === 'multi-select' ? 'multiple' : undefined}
            showSearch
            optionFilterProp="children"
            loading={loadingRelated[field.key]}
            placeholder={`Select ${field.label}`}
            filterOption={(input, option) =>
              option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {relatedData[field.key]?.map(item => (
              <Select.Option key={item.id} value={item.id}>
                {item[field.relation.value]}
              </Select.Option>
            ))}
          </Select>
        );
      case 'number':
        return (
          <InputNumber
            style={{ width: '100%' }}
            min={field.min}
            placeholder={`Enter ${field.label}`}
          />
        );
      case 'currency':
        return (
          <InputNumber
            style={{ width: '100%' }}
            min={field.min}
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
            placeholder={`Enter ${field.label}`}
          />
        );
      case 'textarea':
        return <Input.TextArea placeholder={`Enter ${field.label}`} />;
      default:
        return <Input placeholder={`Enter ${field.label}`} />;
    }
  };

  const columns = [
    ...module.table.columns.map(col => ({
      title: col.title,
      dataIndex: col.key,
      key: col.key,
      sorter: col.sorter,
      ellipsis: true,
      render: (value, record) => {
        if (col.relation) {
          if (col.type === 'array') {
            return Array.isArray(value) 
              ? value.map(v => v[col.relation.value]).join(', ')
              : '';
          }
          return value?.[col.relation.value] || '';
        }
        if (col.type === 'currency') {
          return value ? `$ ${value.toLocaleString()}` : '';
        }
        return value;
      }
    })),
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button 
            type="primary"
            onClick={() => {
              setEditingRecord(record);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Button
            danger
            onClick={() => {
              Modal.confirm({
                title: 'Delete Confirmation',
                content: 'Are you sure you want to delete this item?',
                okText: 'Yes',
                cancelText: 'No',
                onOk: async () => {
                  try {
                    await deleteItem(module.endpoint, record.id);
                    message.success('Item deleted successfully');
                    loadData();
                  } catch (error) {
                    message.error('Delete failed');
                    console.error('Error deleting item:', error);
                  }
                }
              });
            }}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ 
        marginBottom: 16,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Button
          type="primary"
          size="large"
          onClick={() => {
            setEditingRecord(null);
            form.resetFields();
            setModalVisible(true);
          }}
        >
          Add New {module.title}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="id"
        scroll={{ x: 'max-content' }}
        pagination={{
          position: ['bottomCenter'],
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
        }}
      />

      <Modal
        title={`${editingRecord ? 'Edit' : 'Add'} ${module.title}`}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setEditingRecord(null);
        }}
        onOk={() => form.submit()}
        width={720}
        maskClosable={false}
      >
        {Object.values(loadingRelated).some(loading => loading) ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Spin tip="Loading related data..." />
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark="optional"
          >
            {module.form.fields.map(field => (
              <Form.Item
                key={field.key}
                name={field.key}
                label={field.label}
                rules={[{ 
                  required: field.required, 
                  message: `Please input ${field.label}!` 
                }]}
              >
                {renderFormField(field)}
              </Form.Item>
            ))}
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default CrudModule;