import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { BarChart, Bar } from 'recharts';
import { Camera, FileText, Package, DollarSign, AlertTriangle, Box, ShoppingCart, Printer, Download, Calendar as CalendarIcon } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

// Dashboard Component
const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, salesResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/dashboard'),
        axios.get('http://localhost:5000/api/sales/report')
      ]);
      setStats(statsResponse.data);
      setSalesData(Object.entries(salesResponse.data.salesByDay).map(([date, amount]) => ({
        date: format(new Date(date), 'MMM dd'),
        amount
      })));
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSales?.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInventory} items</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingInvoices}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart width={500} height={300} data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#8884d8" />
            </LineChart>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart width={500} height={300} data={stats.topSellingItems || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" fill="#82ca9d" />
            </BarChart>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Invoice Generator Component
const InvoiceGenerator = () => {
  const [invoices, setInvoices] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [invoiceData, setInvoiceData] = useState({
    customerName: '',
    items: [],
    templateId: '',
    dueDate: '',
    notes: '',
    paymentMethod: 'cash'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invoicesRes, inventoryRes, templatesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/invoices'),
        axios.get('http://localhost:5000/api/inventory'),
        axios.get('http://localhost:5000/api/templates')
      ]);
      setInvoices(invoicesRes.data);
      setInventory(inventoryRes.data);
      setTemplates(templatesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      await axios.post('http://localhost:5000/api/invoices', {
        ...invoiceData,
        dueDate: format(selectedDate, 'yyyy-MM-dd')
      });
      setModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to create invoice:', error);
    }
  };

  const handleDeleteInvoice = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/invoices?id=${id}`);
      fetchData();
    } catch (error) {
      console.error('Failed to delete invoice:', error);
    }
  };

  const handlePrintInvoice = (invoice) => {
    // Implement print functionality using selected template
    const template = templates.find(t => t.id === invoice.templateId);
    if (template) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(template.htmlTemplate);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Invoices</h2>
        <Button onClick={() => setModalOpen(true)}>
          Create New Invoice
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell>{invoice.invoice_number}</TableCell>
              <TableCell>{invoice.customer_name}</TableCell>
              <TableCell>${invoice.total_amount}</TableCell>
              <TableCell>
                <Badge variant={invoice.status === 'paid' ? 'success' : 'warning'}>
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handlePrintInvoice(invoice)}>
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteInvoice(invoice.id)}>
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Customer Name"
              value={invoiceData.customerName}
              onChange={(e) => setInvoiceData({ ...invoiceData, customerName: e.target.value })}
            />
            
            <Select onValueChange={(value) => setSelectedTemplate(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="space-y-2">
              <h4 className="font-medium">Select Items</h4>
              {inventory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                  <span>{item.name} - ${item.price}</span>
                  <Input
                    type="number"
                    className="w-20"
                    placeholder="Qty"
                    onChange={(e) => {
                      const quantity = parseInt(e.target.value);
                      if (quantity > 0 && quantity <= item.quantity) {
                        setInvoiceData({
                          ...invoiceData,
                          items: [
                            ...invoiceData.items.filter(i => i.id !== item.id),
                            { id: item.id, name: item.name, quantity, price: item.price }
                          ]
                        });
                      }
                    }}
                  />
                </div>
              ))}
            </div>

            <Calendar
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />

            <Input
              placeholder="Notes"
              value={invoiceData.notes}
              onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateInvoice}>Create Invoice</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Inventory Management Component
const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    price: '',
    category: '',
    supplier: '',
    reorder_point: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/inventory');
      setInventory(response.data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    }
  };

  const handleAddItem = async () => {
    try {
      await axios.post('http://localhost:5000/api/inventory', newItem);
      setModalOpen(false);
      fetchInventory();
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleUpdateItem = async (id, updates) => {
    try {
      await axios.put('http://localhost:5000/api/inventory', { id, ...updates });
      fetchInventory();
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/inventory?id=${id}`);
      fetchInventory();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Inventory</h2>
        <Button onClick={() => setModalOpen(true)}>
          Add New Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {inventory.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>Category: {item.category || 'N/A'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span>{item.quantity}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span>${item.price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Supplier:</span>
                  <span>{item.supplier || 'N/A'}</span>

                  </div>
                <div className="flex justify-between">
                  <span>Reorder Point:</span>
                  <span>{item.reorder_point || 'N/A'}</span>
                </div>
                {item.quantity <= (item.reorder_point || 0) && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Low stock alert! Current quantity is below reorder point.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => handleDeleteItem(item.id)}>
                Delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setNewItem(item);
                  setModalOpen(true);
                }}
              >
                Edit
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{newItem.id ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label>Name</label>
              <Input
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label>Quantity</label>
              <Input
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
              />
            </div>
            
            <div className="space-y-2">
              <label>Price</label>
              <Input
                type="number"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
              />
            </div>
            
            <div className="space-y-2">
              <label>Category</label>
              <Input
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label>Supplier</label>
              <Input
                value={newItem.supplier}
                onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label>Reorder Point</label>
              <Input
                type="number"
                value={newItem.reorder_point}
                onChange={(e) => setNewItem({ ...newItem, reorder_point: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>
              {newItem.id ? 'Update Item' : 'Add Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Sales Report Component
const SalesReport = () => {
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date()
  });

  useEffect(() => {
    fetchSalesReport();
  }, [dateRange]);

  const fetchSalesReport = async () => {
    try {
      const response = await axios.get('/api/sales/report', {
        params: {
          startDate: format(dateRange.startDate, 'yyyy-MM-dd'),
          endDate: format(dateRange.endDate, 'yyyy-MM-dd')
        }
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Failed to fetch sales report:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales Report</CardTitle>
          <CardDescription>View your sales performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-2">Start Date</label>
              <Calendar
                selected={dateRange.startDate}
                onSelect={(date) => setDateRange({ ...dateRange, startDate: date })}
                className="rounded-md border"
              />
            </div>
            <div>
              <label className="block mb-2">End Date</label>
              <Calendar
                selected={dateRange.endDate}
                onSelect={(date) => setDateRange({ ...dateRange, endDate: date })}
                className="rounded-md border"
              />
            </div>
          </div>

          {reportData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Sales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${reportData.totalSales.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Total Items Sold</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reportData.totalItems}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Average Order Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${reportData.averageOrderValue.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Top Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart width={600} height={300} data={Object.entries(reportData.topProducts).map(([name, quantity]) => ({ name, quantity }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="quantity" fill="#8884d8" />
                  </BarChart>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <div className="flex">
          <div className="w-64 bg-white h-screen shadow-lg">
            <div className="p-6">
              <h1 className="text-2xl font-bold">Invoice System</h1>
            </div>
            <nav className="mt-6">
              <Link to="/" className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100">
                <Package className="mr-3" />
                Dashboard
              </Link>
              <Link to="/invoices" className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100">
                <FileText className="mr-3" />
                Invoices
              </Link>
              <Link to="/inventory" className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100">
                <ShoppingCart className="mr-3" />
                Inventory
              </Link>
              <Link to="/sales" className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100">
                <DollarSign className="mr-3" />
                Sales Report
              </Link>
            </nav>
          </div>
          <div className="flex-1">
            <header className="bg-white shadow-sm">
              <div className="px-6 py-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Invoice Management System
                </h2>
              </div>
            </header>
            <main>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/invoices" element={<InvoiceGenerator />} />
                <Route path="/inventory" element={<InventoryManagement />} />
                <Route path="/sales" element={<SalesReport />} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;





----------old working small----------

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { 
  Table, 
  Button, 
  Form, 
  Modal, 
  Input, 
  message, 
  Layout, 
  Menu, 
  Card, 
  Space 
} from 'antd';
import { DashboardOutlined, FileTextOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Header, Sider, Content } = Layout;

// Components
const Dashboard = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/dashboard');
      setStats(response.data);
    } catch (error) {
      message.error('Failed to fetch dashboard stats');
    }
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Total Sales">
          <h2 className="text-2xl">${stats.totalSales}</h2>
        </Card>
        <Card title="Total Inventory">
          <h2 className="text-2xl">{stats.totalInventory} items</h2>
        </Card>
        <Card title="Pending Invoices">
          <h2 className="text-2xl">{stats.pendingInvoices}</h2>
        </Card>
      </div>
    </div>
  );
};

const InvoiceGenerator = () => {
  const [invoices, setInvoices] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    customerName: '',
    items: [],
  });

  useEffect(() => {
    fetchInvoices();
    fetchInventory();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/invoices');
      setInvoices(response.data);
    } catch (error) {
      message.error('Failed to fetch invoices');
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/inventory');
      setInventory(response.data);
    } catch (error) {
      message.error('Failed to fetch inventory');
    }
  };

  const handleCreateInvoice = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/invoices', {
        customerName: invoiceData.customerName,
        items: invoiceData.items,
      });
      message.success('Invoice created successfully!');
      setModalVisible(false);
      fetchInvoices();
      fetchInventory();
    } catch (error) {
      message.error('Failed to create invoice');
    }
  };

  const handleItemSelection = (itemId, quantity) => {
    const selectedItem = inventory.find(item => item.id === itemId);
    if (selectedItem && quantity <= selectedItem.quantity) {
      setInvoiceData({
        ...invoiceData,
        items: [
          ...invoiceData.items,
          { id: selectedItem.id, name: selectedItem.name, quantity, price: selectedItem.price },
        ]
      });
    } else {
      message.error('Not enough stock');
    }
  };

  const handleModalOpen = () => {
    setInvoiceData({ customerName: '', items: [] });
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const columns = [
    { title: 'Invoice #', dataIndex: 'invoice_number', key: 'invoice_number' },
    { title: 'Customer', dataIndex: 'customer_name', key: 'customer_name' },
    { title: 'Amount', dataIndex: 'total_amount', key: 'total_amount' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
  ];

  return (
    <div className="p-6">
      <Button type="primary" onClick={handleModalOpen}>
        Create New Invoice
      </Button>
      <Table columns={columns} dataSource={invoices} rowKey="invoice_number" />
      <Modal
        title="Create New Invoice"
        visible={modalVisible}
        onCancel={handleModalCancel}
        onOk={handleCreateInvoice}
      >
        <Form layout="vertical">
          <Form.Item label="Customer Name">
            <Input
              value={invoiceData.customerName}
              onChange={(e) => setInvoiceData({ ...invoiceData, customerName: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Select Items">
            {inventory.map(item => (
              <div key={item.id}>
                <span>{item.name} - ${item.price}</span>
                <Input
                  type="number"
                  placeholder="Quantity"
                  onBlur={(e) => handleItemSelection(item.id, Number(e.target.value))}
                />
              </div>
            ))}
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const InventoryManagement = () => {
  const [inventory, setInventory] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    price: '',
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/inventory');
      setInventory(response.data);
    } catch (error) {
      message.error('Failed to fetch inventory');
    }
  };

  const handleAddItem = async () => {
    try {
      await axios.post('http://localhost:5000/api/inventory', newItem);
      message.success('Item added successfully!');
      setModalVisible(false);
      fetchInventory();
    } catch (error) {
      message.error('Failed to add item');
    }
  };

  const handleModalOpen = () => {
    setNewItem({ name: '', quantity: '', price: '' });
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const columns = [
    { title: 'Item Name', dataIndex: 'name', key: 'name' },
    { title: 'Quantity', dataIndex: 'quantity', key: 'quantity' },
    { title: 'Price', dataIndex: 'price', key: 'price' },
    { title: 'Created At', dataIndex: 'created_at', key: 'created_at' },
  ];

  return (
    <div className="p-6">
      <Button type="primary" onClick={handleModalOpen}>
        Add New Item
      </Button>
      <Table columns={columns} dataSource={inventory} rowKey="id" />
      <Modal
        title="Add New Item"
        visible={modalVisible}
        onCancel={handleModalCancel}
        onOk={handleAddItem}
      >
        <Form layout="vertical">
          <Form.Item label="Item Name">
            <Input
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Quantity">
            <Input
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            />
          </Form.Item>
          <Form.Item label="Price">
            <Input
              type="number"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider>
          <div className="logo p-4">
            <h1 className="text-white text-xl">Invoice System</h1>
          </div>
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['dashboard']}>
            <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
              <Link to="/">Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="invoices" icon={<FileTextOutlined />}>
              <Link to="/invoices">Invoices</Link>
            </Menu.Item>
            <Menu.Item key="inventory" icon={<ShoppingCartOutlined />}>
              <Link to="/inventory">Inventory</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header className="bg-white p-0" />
          <Content className="bg-gray-100">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/invoices" element={<InvoiceGenerator />} />
              <Route path="/inventory" element={<InventoryManagement />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;
