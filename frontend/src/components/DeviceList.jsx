import React, { useEffect, useState } from 'react';
import { Table, Tag, Typography } from 'antd';
import axios from 'axios';

const { Title } = Typography;

function DeviceList() {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        axios.get('/api/admin/devices')
            .then(res => {
                setDevices(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch devices", err);
                // Mock data
                setDevices([
                    { deviceId: 'urn:focus:device:d1', status: 'ACTIVE', lastSeenAt: '2023-10-27T10:00:00', fingerprint: 'fp1' },
                    { deviceId: 'urn:focus:device:d2', status: 'OFFLINE', lastSeenAt: '2023-10-26T15:00:00', fingerprint: 'fp2' },
                ]);
                setLoading(false);
            });
    }, []);

    const columns = [
        {
            title: 'Device ID',
            dataIndex: 'deviceId',
            key: 'deviceId',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'ACTIVE' ? 'green' : 'volcano'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
        {
            title: 'Last Seen',
            dataIndex: 'lastSeenAt',
            key: 'lastSeenAt',
        },
        {
            title: 'Fingerprint',
            dataIndex: 'fingerprint',
            key: 'fingerprint',
        },
    ];

    return (
        <>
            <Title level={3}>Device Registry</Title>
            <Table
                columns={columns}
                dataSource={devices}
                rowKey="deviceId"
                loading={loading}
            />
        </>
    );
}

export default DeviceList;
