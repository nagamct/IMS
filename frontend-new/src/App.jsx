import ErrorBoundary from './components/ErrorBoundary';
import InvoiceForm from './components/InvoiceForm';

function App() {
  return (
    <ErrorBoundary>
      <InvoiceForm />
    </ErrorBoundary>
  );
}

export default App;