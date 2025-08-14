import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  TextField, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Box
} from '@mui/material';

const InvoiceForm = () => {
  // State management
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form fields
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [discount, setDiscount] = useState(0);
  const [cgst, setCgst] = useState(9);
  const [sgst, setSgst] = useState(9);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, itemsRes] = await Promise.all([
          axios.get('http://localhost:3001/api/customers'),
          axios.get('http://localhost:3001/api/items')
        ]);
        setCustomers(customersRes.data);
        setItems(itemsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Calculate totals
  const subtotal = invoiceItems.reduce((sum, item) => sum + (item.rate * item.quantity), 0);
  const discountAmount = subtotal * (discount / 100);
  const taxableAmount = subtotal - discountAmount;
  const cgstAmount = taxableAmount * (cgst / 100);
  const sgstAmount = taxableAmount * (sgst / 100);
  const total = taxableAmount + cgstAmount + sgstAmount;

  // Handle adding items to invoice
  const handleAddItem = (item) => {
    setInvoiceItems([
      ...invoiceItems,
      {
        id: Date.now(),
        itemId: item.id,
        name: item.name,
        hsnCode: item.hsn_code,
        rate: item.rate,
        quantity: 1
      }
    ]);
    setSearchTerm('');
  };

  // Handle quantity changes
  const handleQuantityChange = (id, value) => {
    setInvoiceItems(invoiceItems.map(item => 
      item.id === id ? {...item, quantity: parseFloat(value) || 0} : item
    ));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const invoiceData = {
        invoiceNumber,
        date: invoiceDate,
        customerId: selectedCustomer,
        subtotal,
        discount: discountAmount,
        cgst,
        sgst,
        total,
        items: invoiceItems.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          rate: item.rate
        }))
      };
      
      const response = await axios.post('http://localhost:3001/api/invoices', invoiceData);
      alert('Invoice created successfully!');
      // Reset form
      setInvoiceItems([]);
      setSelectedCustomer('');
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Failed to create invoice');
    }
  };

  return (
    <Box component={Paper} elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Create New Invoice
      </Typography>
      
      <form onSubmit={handleSubmit}>
        {/* Customer Selection */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Customer</InputLabel>
          <Select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            required
          >
            {customers.map(customer => (
              <MenuItem key={customer.id} value={customer.id}>
                {customer.name} ({customer.gstin})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Invoice Details */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="Invoice Number"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Date"
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Box>

        {/* Item Search and Selection */}
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Search Items"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
          {searchTerm && (
            <Box sx={{ maxHeight: 200, overflow: 'auto', mt: 1, border: 1, borderColor: 'divider' }}>
              {items
                .filter(item => 
                  item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  item.hsn_code.includes(searchTerm)
                )
                .map(item => (
                  <Box 
                    key={item.id} 
                    onClick={() => handleAddItem(item)}
                    sx={{ p: 1, borderBottom: 1, borderColor: 'divider', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <Typography>{item.name}</Typography>
                    <Typography variant="body2">HSN: {item.hsn_code} | ₹{item.rate}</Typography>
                  </Box>
                ))
              }
            </Box>
          )}
        </Box>

        {/* Items Table */}
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>HSN Code</TableCell>
                <TableCell>Rate</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoiceItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.hsnCode}</TableCell>
                  <TableCell>₹{item.rate}</TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                      size="small"
                      sx={{ width: 80 }}
                    />
                  </TableCell>
                  <TableCell>₹{(item.rate * item.quantity).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button 
                      color="error"
                      onClick={() => setInvoiceItems(invoiceItems.filter(i => i.id !== item.id))}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Totals Section */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Box sx={{ width: 300 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Subtotal:</Typography>
              <Typography>₹{subtotal.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>Discount ({discount}%):</Typography>
              <Typography>-₹{discountAmount.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>CGST ({cgst}%):</Typography>
              <Typography>₹{cgstAmount.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>SGST ({sgst}%):</Typography>
              <Typography>₹{sgstAmount.toFixed(2)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">₹{total.toFixed(2)}</Typography>
            </Box>
          </Box>
        </Box>

        {/* Tax and Discount Controls */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            label="Discount %"
            type="number"
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            sx={{ width: 120 }}
          />
          <TextField
            label="CGST %"
            type="number"
            value={cgst}
            onChange={(e) => setCgst(parseFloat(e.target.value) || 0)}
            sx={{ width: 120 }}
          />
          <TextField
            label="SGST %"
            type="number"
            value={sgst}
            onChange={(e) => setSgst(parseFloat(e.target.value) || 0)}
            sx={{ width: 120 }}
          />
        </Box>

        {/* Submit Button */}
        <Button 
          type="submit" 
          variant="contained" 
          size="large"
          disabled={!selectedCustomer || invoiceItems.length === 0}
        >
          Create Invoice
        </Button>
      </form>
    </Box>
  );
};

export default InvoiceForm;