import React from 'react';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import { ArrowUpOutlined, UserOutlined } from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const { Title } = Typography;

const data = [
    { name: 'Mon', focus: 75, away: 10 },
    { name: 'Tue', focus: 82, away: 15 },
    { name: 'Wed', focus: 60, away: 30 },
    { name: 'Thu', focus: 90, away: 5 },
    { name: 'Fri', focus: 85, away: 10 },
];

function Dashboard() {
    return (
        <>
            <Title level={2}>Dashboard</Title>
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Card bordered={false}>
                        <Statistic
                            title="Connected Devices"
                            value={12}
                            prefix={<UserOutlined />}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false}>
                        <Statistic
                            title="Avg Focus (Today)"
                            value={85}
                            precision={1}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<ArrowUpOutlined />}
                            suffix="%"
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card bordered={false}>
                        <Statistic
                            title="Idle Alerts"
                            value={0}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={24}>
                    <Card title="Focus Trend (Daily Avg)" bordered={false}>
                        <div style={{ height: 300, width: '100%' }}>
                            <ResponsiveContainer>
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="focus" stroke="#1677ff" strokeWidth={2} />
                                    <Line type="monotone" dataKey="away" stroke="#82ca9d" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </Col>
            </Row>
        </>
    );
}

export default Dashboard;
