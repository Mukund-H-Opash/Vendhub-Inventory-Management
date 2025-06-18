// src/components/dashboard/SalesSummaryTable.jsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography
} from '@mui/material';

// Helper to format dates nicely
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default function SalesSummaryTable({ summaryData }) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead sx={{ backgroundColor: '#f7f7f9' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>UPC</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Units Sold</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Most Recent Sale</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {summaryData.map((item) => (
            <TableRow key={item.upc} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th" scope="row">
                {item.product_name || 'N/A'}
              </TableCell>
              <TableCell>{item.upc}</TableCell>
              <TableCell align="right">
                <Typography fontWeight="bold" color="primary">{item.total_units_sold}</Typography>
              </TableCell>
              <TableCell>{formatDate(item.last_sale_date)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}