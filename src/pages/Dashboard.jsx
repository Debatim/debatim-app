import { Typography, Card, Flex, Row, Col } from 'antd'
import StatCard from '../components/statCard'
import {
  FileTextOutlined,
  LineChartOutlined,
  PieChartOutlined,
  UserOutlined,
} from '@ant-design/icons'
import useStatsFromCsv from '../hooks/useStatsFromCsv'
const { Title, Text } = Typography

export default function Dashboard() {
  const csvUrl = new URL('../assets/parlamentares.csv', import.meta.url).href
  const { error, loading, stats } = useStatsFromCsv(csvUrl)
  return (
    <>
      {error && <div style={{ color: 'red' }}>Erro ao ler CSV: {String(error)}</div>}

      <Title level={3}>Painel Analítico</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard loading={loading} title="Contas" value={stats.contas} icon={<UserOutlined />} />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            loading={loading}
            title="Posts"
            value={stats.posts}
            icon={<FileTextOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            loading={loading}
            title="Interações"
            value={stats.interacoes}
            icon={<PieChartOutlined />}
          />
        </Col>
        {stats.visualizacoes !== null && (
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Visualizações"
              value={stats.visualizacoes}
              icon={<LineChartOutlined />}
              loading={loading}
            />
          </Col>
        )}
      </Row>

      <Flex gap={16} wrap style={{ marginTop: 30 }}>
        <Card title="Posts" style={{ flex: 1, minWidth: 260 }}>
          <Text>Gráficos</Text>
        </Card>
      </Flex>
    </>
  )
}
