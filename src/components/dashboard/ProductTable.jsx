// src/components/dashboard/ProductTable.jsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Typography
} from '@mui/material';

// Helper to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  // Adjust for timezone to prevent off-by-one day errors
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Helper to format currency
const formatCurrency = (amount) => {
  if (amount === null || isNaN(amount)) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export default function SalesTransactionTable({ salesData }) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead sx={{ backgroundColor: '#f7f7f9' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Sale Date</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>UPC</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Unit Price</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Final Total</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {salesData.map((sale) => (
            // <Tooltip title={`Transaction ID: ${sale.id}`} key={sale.id} placement="top" arrow>
              <TableRow hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }} key={sale.id}>
                <TableCell>{formatDate(sale.sale_date)}</TableCell>
                <TableCell component="th" scope="row">
                  {sale.product_name || 'N/A'}
                </TableCell>
                <TableCell>{sale.upc}</TableCell>
                <TableCell align="right">{formatCurrency(sale.unit_price)}</TableCell>
                <TableCell align="right">{formatCurrency(sale.final_total)}</TableCell>
              </TableRow>
            // </Tooltip>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}