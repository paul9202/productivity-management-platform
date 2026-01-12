import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { name: 'Mon', focus: 75, away: 10 },
    { name: 'Tue', focus: 82, away: 15 },
    { name: 'Wed', focus: 60, away: 30 },
    { name: 'Thu', focus: 90, away: 5 },
    { name: 'Fri', focus: 85, away: 10 },
];

function Dashboard() {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="h4" gutterBottom>Dashboard</Typography>
            </Grid>
            <Grid item xs={12} md={8}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
                    <Typography variant="h6" gutterBottom>Focus Trend (Daily Avg)</Typography>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none' }} itemStyle={{ color: '#fff' }} />
                            <Line type="monotone" dataKey="focus" stroke="#8884d8" />
                            <Line type="monotone" dataKey="away" stroke="#82ca9d" />
                        </LineChart>
                    </ResponsiveContainer>
                </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 300 }}>
                    <Typography variant="h6">Quick Stats</Typography>
                    <Typography variant="body1">Connected Devices: 12</Typography>
                    <Typography variant="body1">Avg Focus (Today): 85%</Typography>
                    <Typography variant="body1">Alerts: 0</Typography>
                </Paper>
            </Grid>
        </Grid>
    );
}

export default Dashboard;
