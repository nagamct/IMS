import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Autocomplete
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';

const InvoiceForm = () => {
  // State management
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState(null);

  // Form fields
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [discount, setDiscount] = useState(0);
  const [cgst, setCgst] = useState(9);
  const [sgst, setSgst] = useState(9);

  // Fetch data with error handling
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersRes, itemsRes] = await Promise.all([
          axios.get('http://localhost:3001/api/customers'),
          axios.get('http://localhost:3001/api/items')
        ]);
        
        const formattedItems = itemsRes.data.map(item => ({
          ...item,
          rate: Number(item.rate) || 0,
          label: `${item.name} (HSN: ${item.hsn_code}) - ₹${(Number(item.rate) || 0).toFixed(2)}`
        }));

        setCustomers(customersRes.data);
        setItems(formattedItems);
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      }
    };
    fetchData();
  }, []);

  // Safe calculations
  const subtotal = invoiceItems.reduce((sum, item) => {
    const rate = Number(item.rate) || 0;
    const qty = Number(item.quantity) || 0;
    return sum + (rate * qty);
  }, 0);
  
  const discountAmount = subtotal * (Math.min(100, Math.max(0, Number(discount))) / 100);
  const taxableAmount = subtotal - discountAmount;
  const cgstAmount = taxableAmount * (Math.max(0, Number(cgst))) / 100;
  const sgstAmount = taxableAmount * (Math.max(0, Number(sgst))) / 100;
  const total = taxableAmount + cgstAmount + sgstAmount;

  // Handler functions with validation
  const handleAddItem = () => {
    if (!selectedItem) return;
    
    try {
      setInvoiceItems([
        ...invoiceItems,
        {
          id: Date.now(),
          itemId: selectedItem.id,
          name: selectedItem.name,
          hsnCode: selectedItem.hsn_code,
          rate: Number(selectedItem.rate) || 0,
          quantity: Math.max(1, Number(quantity) || 1)
        }
      ]);
      
      setSelectedItem(null);
      setQuantity(1);
    } catch (err) {
      console.error('Error adding item:', err);
      setError('Failed to add item. Please try again.');
    }
  };

  const handleRemoveItem = (id) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== id));
  };

  const handleQuantityChange = (id, value) => {
    const numValue = Math.max(1, Number(value) || 1);
    setInvoiceItems(invoiceItems.map(item => 
      item.id === id ? {...item, quantity: numValue} : item
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clear previous errors
      setError(null);

      // Validate required fields
      if (!selectedCustomer || invoiceItems.length === 0 || !invoiceNumber) {
        setError('Please fill all required fields and add at least one item');
        return;
      }

      // Prepare items with calculated amounts
      const itemsWithAmounts = invoiceItems.map(item => ({
        item_id: item.itemId,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.rate * item.quantity  // This fixes the null amount error
      }));

      const invoiceData = {
        invoice_number: invoiceNumber,
        date: invoiceDate,
        customer_id: selectedCustomer,
        subtotal,
        discount: discountAmount,
        cgst_percentage: cgst,
        sgst_percentage: sgst,
        total,
        items: itemsWithAmounts  // Send items with calculated amounts
      };

      console.log('Submitting:', invoiceData);  // For debugging

      const response = await axios.post('http://localhost:3001/api/invoices', invoiceData);
      
      // Success handling
      console.log('Success:', response.data);
      alert('Invoice created successfully!');
      
      // Reset form
      setInvoiceItems([]);
      setSelectedCustomer('');
      setInvoiceNumber('');

      
      
    } catch (error) {
      console.error('Full error:', error);
      const serverMessage = error.response?.data?.message || 
                          error.response?.data?.error?.message ||
                          error.message;
      setError(`Failed to create invoice: ${serverMessage}`);
    }
  };

  if (error) {
    return (
      <Container maxWidth="md" sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', color: 'error.main' }}>
          <Typography variant="h6">{error}</Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Create New Invoice
        </Typography>
        
        <form onSubmit={handleSubmit}>
          {/* Customer Selection */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Customer</InputLabel>
            <Select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              required
              label="Customer"
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

          {/* Item Selection */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Autocomplete
              options={items}
              value={selectedItem}
              onChange={(e, newValue) => setSelectedItem(newValue)}
              sx={{ width: '70%' }}
              renderInput={(params) => (
                <TextField {...params} label="Search and select item" />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
            <TextField
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              sx={{ width: '20%' }}
              inputProps={{ min: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleAddItem}
              disabled={!selectedItem}
              sx={{ width: '10%' }}
              startIcon={<Add />}
            >
              Add
            </Button>
          </Box>

          {/* Items Table */}
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>HSN Code</TableCell>
                  <TableCell>Rate (₹)</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Amount (₹)</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoiceItems.map((item) => {
                  const rate = Number(item.rate) || 0;
                  const qty = Number(item.quantity) || 0;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.hsnCode}</TableCell>
                      <TableCell>{rate.toFixed(2)}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={qty}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          size="small"
                          sx={{ width: 80 }}
                          inputProps={{ min: 1 }}
                        />
                      </TableCell>
                      <TableCell>{(rate * qty).toFixed(2)}</TableCell>
                      <TableCell>
                        <Button 
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mt: 2, 
                pt: 2, 
                borderTop: 1, 
                borderColor: 'divider' 
              }}>
                <Typography variant="h6">Total:</Typography>
                <Typography variant="h6">₹{total.toFixed(2)}</Typography>
              </Box>
            </Box>
          </Box>

          {/* Tax/Discount Controls */}
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <TextField
              label="Discount %"
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
              sx={{ width: 120 }}
              inputProps={{ min: 0, max: 100 }}
            />
            <TextField
              label="CGST %"
              type="number"
              value={cgst}
              onChange={(e) => setCgst(Math.max(0, Number(e.target.value) || 0))}
              sx={{ width: 120 }}
              inputProps={{ min: 0 }}
            />
            <TextField
              label="SGST %"
              type="number"
              value={sgst}
              onChange={(e) => setSgst(Math.max(0, Number(e.target.value) || 0))}
              sx={{ width: 120 }}
              inputProps={{ min: 0 }}
            />
          </Box>
          

          {/* Submit Button */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button 
              type="submit" 
              variant="contained" 
              size="large"
              disabled={!selectedCustomer || invoiceItems.length === 0}
              sx={{ px: 6, py: 1.5 }}
            >
              Create Invoice
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default InvoiceForm;