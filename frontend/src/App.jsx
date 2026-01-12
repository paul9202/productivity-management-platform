import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, theme } from 'antd';
import {
    DesktopOutlined,
    DashboardOutlined,
    SafetyCertificateOutlined,
} from '@ant-design/icons';
import Dashboard from './components/Dashboard';
import DeviceList from './components/DeviceList';
import PolicyManager from './components/PolicyManager';

const { Header, Content, Footer, Sider } = Layout;

function AppLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const location = useLocation();

    const items = [
        {
            key: '/',
            icon: <DashboardOutlined />,
            label: <Link to="/">Dashboard</Link>,
        },
        {
            key: '/devices',
            icon: <DesktopOutlined />,
            label: <Link to="/devices">Devices</Link>,
        },
        {
            key: '/policy',
            icon: <SafetyCertificateOutlined />,
            label: <Link to="/policy">Policy</Link>,
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div className="demo-logo-vertical" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6 }} />
                <Menu theme="dark" defaultSelectedKeys={[location.pathname]} mode="inline" items={items} />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer, textAlign: 'center' }}>
                    <h2 style={{ lineHeight: '64px', margin: 0 }}>Productivity-X Admin</h2>
                </Header>
                <Content style={{ margin: '16px 16px' }}>
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/devices" element={<DeviceList />} />
                            <Route path="/policy" element={<PolicyManager />} />
                        </Routes>
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    Productivity-X ©2023 Created by Antigravity
                </Footer>
            </Layout>
        </Layout>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppLayout />
        </BrowserRouter>
    );
}

export default App;
