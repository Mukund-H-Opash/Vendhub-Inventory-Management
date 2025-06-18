// src/components/dashboard/ProductListTable.jsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

export default function ProductListTable({ products }) {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead sx={{ backgroundColor: '#f7f7f7' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>UPC</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((item, index) => (
            <TableRow key={index} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th" scope="row">
                {item.product_name}
              </TableCell>
              <TableCell>{item.upc}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}