import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Chip } from '@mui/material';
import axios from 'axios';

function DeviceList() {
    const [devices, setDevices] = useState([]);

    useEffect(() => {
        // Fetch devices from backend. For MVP using mock if backend is not up or CORS.
        // In local dev with proxy, this works if backend is running.
        axios.get('/api/admin/devices')
            .then(res => setDevices(res.data))
            .catch(err => {
                console.error("Failed to fetch devices", err);
                // Mock data for UI preview
                setDevices([
                    { deviceId: 'urn:focus:device:d1', status: 'ACTIVE', lastSeenAt: '2023-10-27T10:00:00' },
                    { deviceId: 'urn:focus:device:d2', status: 'OFFLINE', lastSeenAt: '2023-10-26T15:00:00' },
                ]);
            });
    }, []);

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden', p: 2 }}>
            <Typography variant="h5" gutterBottom>Device Registry</Typography>
            <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Device ID</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Last Seen</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {devices.map((device) => (
                            <TableRow hover role="checkbox" tabIndex={-1} key={device.deviceId}>
                                <TableCell>{device.deviceId}</TableCell>
                                <TableCell>
                                    <Chip label={device.status} color={device.status === 'ACTIVE' ? 'success' : 'default'} />
                                </TableCell>
                                <TableCell>{device.lastSeenAt}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}

export default DeviceList;
