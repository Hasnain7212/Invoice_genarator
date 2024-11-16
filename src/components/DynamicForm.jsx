// components/DynamicForm.jsx
import React from 'react';
import { Form, Input, InputNumber, Select, DatePicker, Button, Space } from 'antd';
import { useQuery } from 'react-query';
import { apiHandler } from '../utils/api';

const { Option } = Select;

const fieldComponents = {
  text: Input,
  number: InputNumber,
  select: Select,
  date: DatePicker,
  textarea: Input.TextArea,
  currency: (props) => (
    <InputNumber
      {...props}
      formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
      parser={(value) => value?.replace(/\$\s?|(,*)/g, '')}
      style={{ width: '100%' }}
    />
  )
};

export const DynamicForm = ({ fields, initialValues, onSubmit, onCancel }) => {
  const [form] = Form.useForm();

  // Get fields that need options
  const optionsFields = fields.filter(field => field.options);

  // Fetch options for select fields
  const optionsQueries = optionsFields.map(field => ({
    queryKey: ['options', field.options],
    queryFn: () => apiHandler(`/api/${field.options}`),
    field
  }));

  const { data: optionsData } = useQuery(
    ['formOptions', optionsFields.map(f => f.options)],
    async () => {
      if (optionsFields.length === 0) return {};
      
      try {
        const results = await Promise.all(
          optionsQueries.map(q => q.queryFn())
        );
        
        return optionsQueries.reduce((acc, q, index) => ({
          ...acc,
          [q.field.key]: results[index] || []
        }), {});
      } catch (error) {
        console.error('Error fetching options:', error);
        return {};
      }
    },
    {
      enabled: optionsFields.length > 0,
      staleTime: 30000
    }
  );

  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [form, initialValues]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const renderField = (field) => {
    const { key, type = 'text', options, ...rest } = field;
    const Component = fieldComponents[type] || Input;

    if (type === 'select' && options) {
      return (
        <Select {...rest}>
          {(optionsData?.[key] || []).map(option => (
            <Option key={option.id} value={option.id}>
              {option.name}
            </Option>
          ))}
        </Select>
      );
    }

    return <Component {...rest} />;
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={initialValues}
    >
      {fields.map((field) => (
        <Form.Item
          key={field.key}
          name={field.key}
          label={field.title || field.label}
          rules={[
            ...(field.required ? [{ required: true, message: `${field.title || field.label} is required` }] : []),
            ...(field.rules || [])
          ]}
        >
          {renderField(field)}
        </Form.Item>
      ))}
      <Form.Item>
        <Space className="flex justify-end">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            {initialValues ? 'Update' : 'Submit'}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};