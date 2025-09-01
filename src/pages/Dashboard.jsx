import { Typography, Card, Flex, Row, Col } from "antd";
import StatCard from "../components/statCard";
import {
  FileTextOutlined,
  LineChartOutlined,
  PieChartOutlined,
  UserOutlined,
} from "@ant-design/icons";
const { Title, Text } = Typography;

export default function Dashboard() {
  return (
    <>
      <Title level={3}>Painel Analítico</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Contas" value={8017} icon={<UserOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard title="Posts" value={101202} icon={<FileTextOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Interações"
            value={183107470}
            icon={<PieChartOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Visualizações"
            value={361945961}
            icon={<LineChartOutlined />}
          />
        </Col>
      </Row>

      <Flex gap={16} wrap style={{ marginTop: 30 }}>
        <Card title="Posts" style={{ flex: 1, minWidth: 260 }}>
          <Text>Gráficos</Text>
        </Card>
      </Flex>
    </>
  );
}
