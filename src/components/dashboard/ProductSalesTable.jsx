// src/components/dashboard/ProductSalesTable.jsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

// Helper to format dates nicely
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};


const formatCurrency = (amount) => {
  if (amount === null || isNaN(amount)) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};


export default function ProductSalesTable({ salesData }) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead sx={{ backgroundColor: '#f7f7f7' }}>
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
            
              <TableRow hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }} key={sale.id}>
                <TableCell>{formatDate(sale.sale_date)}</TableCell>
                <TableCell component="th" scope="row">
                  {sale.product_name} 
                </TableCell>
                <TableCell>{sale.upc}</TableCell>
                <TableCell align="right">{formatCurrency(sale.unit_price)}</TableCell>
                <TableCell align="right">{formatCurrency(sale.final_total)}</TableCell>
              </TableRow>
           
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}