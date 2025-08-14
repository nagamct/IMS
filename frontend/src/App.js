import React from 'react';
import InvoiceForm from './components/InvoiceForm';
import { CssBaseline, Container } from '@mui/material';

function App() {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="md">
        <InvoiceForm />
      </Container>
    </>
  );
}

export default App;