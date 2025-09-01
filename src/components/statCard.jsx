import { Card, Typography } from 'antd'
import { formatCompact } from '../utils/formatters'

const { Text, Title } = Typography

export default function StatCard({
  title,
  value,
  icon,
  loading = false,
  valueFormatter = formatCompact, // <= aqui
}) {
  return (
    <Card
      loading={loading}
      style={{ borderRadius: 12, boxShadow: '0 4px 18px rgba(0,0,0,0.06)' }}
      bodyStyle={{ padding: 20 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Text
            style={{
              opacity: 0.65,
              textTransform: 'uppercase',
              fontWeight: 700,
              letterSpacing: 0.6,
              fontSize: 12,
            }}
          >
            {title}
          </Text>
          <Title level={3} style={{ margin: 0, marginTop: 4 }}>
            {valueFormatter(value)}
          </Title>
        </div>
        <div
          style={{
            position: 'relative',
            width: 56,
            height: 56,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <div style={{ fontSize: 22 }}>{icon}</div>
        </div>
      </div>
    </Card>
  )
}
