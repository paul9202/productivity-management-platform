import React from 'react';
import { Paper, Typography, TextField, Button, Grid } from '@mui/material';

function PolicyManager() {
    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>Global Policy Management</Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Focus Threshold (Score)" defaultValue="50" />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Idle Timeout (Seconds)" defaultValue="300" />
                </Grid>
                <Grid item xs={12}>
                    <TextField fullWidth label="Allowed App Categories (CSV)" defaultValue="work,utility,education" />
                </Grid>
                <Grid item xs={12}>
                    <Button variant="contained" color="primary">Save Policy</Button>
                </Grid>
            </Grid>
        </Paper>
    );
}

export default PolicyManager;
