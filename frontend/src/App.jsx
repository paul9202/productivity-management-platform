import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DevicesIcon from '@mui/icons-material/Devices';
import SecurityIcon from '@mui/icons-material/Security';
import Dashboard from './components/Dashboard';
import DeviceList from './components/DeviceList';
import PolicyManager from './components/PolicyManager';

const drawerWidth = 240;

function App() {
    return (
        <BrowserRouter>
            <Box sx={{ display: 'flex' }}>
                <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                    <Toolbar>
                        <Typography variant="h6" noWrap component="div">
                            Productivity-X Admin
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                    }}
                >
                    <Toolbar />
                    <Box sx={{ overflow: 'auto' }}>
                        <List>
                            <ListItem button component={Link} to="/">
                                <ListItemIcon><DashboardIcon /></ListItemIcon>
                                <ListItemText primary="Dashboard" />
                            </ListItem>
                            <ListItem button component={Link} to="/devices">
                                <ListItemIcon><DevicesIcon /></ListItemIcon>
                                <ListItemText primary="Devices" />
                            </ListItem>
                            <ListItem button component={Link} to="/policy">
                                <ListItemIcon><SecurityIcon /></ListItemIcon>
                                <ListItemText primary="Policy" />
                            </ListItem>
                        </List>
                    </Box>
                </Drawer>
                <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                    <Toolbar />
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/devices" element={<DeviceList />} />
                        <Route path="/policy" element={<PolicyManager />} />
                    </Routes>
                </Box>
            </Box>
        </BrowserRouter>
    );
}

export default App;
