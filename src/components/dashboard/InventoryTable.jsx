"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
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
    Box,
    Typography,
    CircularProgress
} from '@mui/material';
import { Edit, Delete, Save, Cancel } from '@mui/icons-material';
import toast from 'react-hot-toast';

export default function InventoryTable({ initialInventory = [] }) {
    const router = useRouter();
    const supabase = createClient();

    const [localInventory, setLocalInventory] = useState(initialInventory); // 🟡 NEW
    const [editingRowId, setEditingRowId] = useState(null);
    const [stockValue, setStockValue] = useState('');
    const [savingRowId, setSavingRowId] = useState(null);

    // --- EDIT LOGIC ---
    const handleEditClick = (item) => {
        setEditingRowId(item.id);
        setStockValue(item.stock_level);
    };

    const handleCancelClick = () => {
        setEditingRowId(null);
        setStockValue('');
    };

    const handleSaveClick = async (inventoryId) => {
        if (!stockValue || isNaN(parseInt(stockValue, 10))) {
            toast.error("Please enter a valid number for the stock level.");
            return;
        }

        const newStock = parseInt(stockValue, 10);
        setSavingRowId(inventoryId);

        const { error } = await supabase
            .from('inventory')
            .update({ stock_level: newStock })
            .eq('id', inventoryId);

        if (error) {
            toast.error(`Error updating stock: ${error.message}`);
        } else {
            toast.success("Stock level updated!");

            // 🟢 Instant UI update: Optimistically update localInventory
            const updatedInventory = localInventory.map(item =>
                item.id === inventoryId ? { ...item, stock_level: newStock } : item
            );
            setLocalInventory(updatedInventory);

            setEditingRowId(null);
            setStockValue('');
            router.refresh(); // still sync data in background
        }

        setSavingRowId(null);
    };

    // --- DELETE LOGIC ---
    const handleDeleteClick = async (inventoryId) => {
        if (window.confirm("Are you sure you want to remove this item from the inventory?")) {
            const { error } = await supabase
                .from('inventory')
                .delete()
                .eq('id', inventoryId);

            if (error) {
                toast.error(`Error deleting item: ${error.message}`);
            } else {
                toast.success("Item removed from inventory.");
                router.refresh();
            }
        }
    };

    return (
        <TableContainer component={Paper} variant="outlined" sx={{ mt: 4 }}>
            <Table>
                <TableHead sx={{ backgroundColor: '#f7f7f7' }}>
                    <TableRow>
                        <TableCell>Product Name</TableCell>
                        <TableCell>UPC</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="center">Current Stock</TableCell>
                        <TableCell align="center">Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {localInventory.length > 0 ? (
                        localInventory.map((item) => {
                            const isEditing = editingRowId === item.id;
                            const isSaving = savingRowId === item.id;

                            return (
                                <TableRow key={item.id}>
                                    <TableCell>{item.products.display_name}</TableCell>
                                    <TableCell>{item.products.upc}</TableCell>
                                    <TableCell align="right">${item.products.unit_price}</TableCell>
                                    <TableCell align="center">
                                        {isEditing ? (
                                            isSaving ? (
                                                <CircularProgress size={20} />
                                            ) : (
                                                <TextField
                                                    size="small"
                                                    type="number"
                                                    value={stockValue}
                                                    onChange={(e) => setStockValue(e.target.value)}
                                                    variant="outlined"
                                                    sx={{ width: '80px' }}
                                                    autoFocus
                                                />
                                            )
                                        ) : isSaving ? (
                                            <CircularProgress size={20} />
                                        ) : (
                                            <Typography fontWeight="bold">{item.stock_level}</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        {isEditing ? (
                                            isSaving ? (
                                                <CircularProgress size={24} />
                                            ) : (
                                                <Box>
                                                    <IconButton color="primary" onClick={() => handleSaveClick(item.id)} aria-label="save">
                                                        <Save />
                                                    </IconButton>
                                                    <IconButton onClick={handleCancelClick} aria-label="cancel">
                                                        <Cancel />
                                                    </IconButton>
                                                </Box>
                                            )
                                        ) : (
                                            <Box>
                                                <IconButton color="primary" onClick={() => handleEditClick(item)} aria-label="edit">
                                                    <Edit />
                                                </IconButton>
                                                <IconButton color="error" onClick={() => handleDeleteClick(item.id)} aria-label="delete">
                                                    <Delete />
                                                </IconButton>
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} align="center">
                                No inventory data found for this location.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
