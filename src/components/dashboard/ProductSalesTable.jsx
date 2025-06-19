// src/components/dashboard/ProductSalesTable.jsx
"use client";

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Box,
} from '@mui/material';
import { Edit, Delete, Save, Cancel } from '@mui/icons-material';
import { updateSaleRecord, deleteSaleRecord } from '@/app/actions';
import { toast } from 'react-toastify';

/**
 * A single, stateful row in the sales table that handles its own
 * editing, loading, and delete confirmation state.
 */
function EditableTableRow({ rowData, onCancelEdit, isEditing, onStartEdit }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // State to hold the values of the input fields while editing
  const [editedData, setEditedData] = useState({
    sale_date: new Date(rowData.sale_date).toISOString().split('T')[0],
    unit_price: rowData.unit_price,
    final_total: rowData.final_total,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };
  
  // Calls the server action to update the record
  const handleUpdate = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('id', rowData.id);
    formData.append('sale_date', editedData.sale_date);
    formData.append('unit_price', editedData.unit_price);
    // Use 'final_total' to match the database column
    formData.append('final_total', editedData.final_total);

    // This part is a bit tricky, since `updateSaleRecord` might not be defined
    // in the global scope. We assume it's imported from actions.
    const result = await updateSaleRecord(formData);

    setIsLoading(false);
    if (result?.error) {
      toast.error(`Error: ${result.details || result.error}`);
    } else {
      toast.success("Record updated successfully!");
      onCancelEdit(); // Exit editing mode
    }
  };

  // Calls the server action to delete the record
  const handleDelete = async () => {
    setDeleteDialogOpen(false);
    setIsLoading(true); // Show loader on the row while deleting
    
    const result = await deleteSaleRecord(rowData.id);
    
    setIsLoading(false);
    if (result?.error) {
      toast.error(`Error: ${result.details || result.error}`);
    } else {
      toast.success("Record deleted successfully!");
      // The page will revalidate and the row will disappear automatically
    }
  };
  
  // Helper to format currency
  const formatCurrency = (amount) => {
    if (amount === null || isNaN(amount)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Render the row in EDIT mode
  if (isEditing) {
    return (
      <TableRow>
        <TableCell><TextField name="sale_date" type="date" value={editedData.sale_date} onChange={handleInputChange} size="small" /></TableCell>
        <TableCell>{rowData.product_name}</TableCell> {/* Not Editable */}
        <TableCell>{rowData.upc}</TableCell> {/* Not Editable */}
        <TableCell align="right"><TextField name="unit_price" type="number" value={editedData.unit_price} onChange={handleInputChange} size="small" inputProps={{ step: "0.01" }} /></TableCell>
        <TableCell align="right"><TextField name="final_total" type="number" value={editedData.final_total} onChange={handleInputChange} size="small" inputProps={{ step: "0.01" }} /></TableCell>
        <TableCell align="center">
          {isLoading ? <CircularProgress size={24} /> : (
            <>
              <IconButton color="primary" onClick={handleUpdate}><Save /></IconButton>
              <IconButton onClick={onCancelEdit}><Cancel /></IconButton>
            </>
          )}
        </TableCell>
      </TableRow>
    );
  }

  // Render the row in READ-ONLY mode
  return (
    <>
      <TableRow hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
        <TableCell>{new Date(rowData.sale_date).toLocaleDateString()}</TableCell>
        <TableCell>{rowData.product_name}</TableCell>
        <TableCell>{rowData.upc}</TableCell>
        <TableCell align="right">{formatCurrency(rowData.unit_price)}</TableCell>
        <TableCell align="right">{formatCurrency(rowData.final_total)}</TableCell>
        <TableCell align="center">
           {isLoading ? <CircularProgress size={24} /> : (
            <>
              <IconButton onClick={() => onStartEdit(rowData)}><Edit /></IconButton>
              <IconButton onClick={() => setDeleteDialogOpen(true)} color="error"><Delete /></IconButton>
            </>
           )}
        </TableCell>
      </TableRow>

      {/* Confirmation Dialog for Deletion */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this record for "{rowData.product_name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/**
 * The main table component that holds the state for which row is being edited.
 */
export default function ProductSalesTable({ salesData }) {
  const [editingRowId, setEditingRowId] = useState(null);

  const handleStartEdit = (row) => {
    setEditingRowId(row.id);
  };

  const handleCancelEdit = () => {
    setEditingRowId(null);
  };

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
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {salesData.map((sale) => (
            <EditableTableRow
              key={sale.id}
              rowData={sale}
              isEditing={editingRowId === sale.id}
              onStartEdit={handleStartEdit}
              onCancelEdit={handleCancelEdit}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}