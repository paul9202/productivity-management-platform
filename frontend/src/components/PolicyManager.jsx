import React from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';

const { Title } = Typography;

function PolicyManager() {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        console.log('Success:', values);
        message.success('Policy updated successfully');
    };

    return (
        <Card title="Global Policy Management" bordered={false} style={{ maxWidth: 800 }}>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    focusThreshold: 50,
                    idleTimeout: 300,
                    allowedApps: 'work,utility,education',
                }}
            >
                <Form.Item
                    label="Focus Threshold (Score)"
                    name="focusThreshold"
                    rules={[{ required: true, message: 'Please input threshold!' }]}
                >
                    <Input type="number" />
                </Form.Item>

                <Form.Item
                    label="Idle Timeout (Seconds)"
                    name="idleTimeout"
                    rules={[{ required: true, message: 'Please input timeout!' }]}
                >
                    <Input type="number" />
                </Form.Item>

                <Form.Item
                    label="Allowed App Categories (CSV)"
                    name="allowedApps"
                >
                    <Input />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Save Policy
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
}

export default PolicyManager;
