import { Card, Typography, theme } from "antd";

const { Text, Title } = Typography;

const formatNumber = (n) => new Intl.NumberFormat("pt-BR").format(n);

export default function StatCard({ title, value, icon, loading = false }) {
  const { token } = theme.useToken();
  const text = token.colorText;
  const primary = token.colorPrimary;

  return (
    <Card
      loading={loading}
      style={{
        borderRadius: 12,
        boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
      }}
      bodyStyle={{ padding: 20 }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <Text
            style={{
              color: text,
              opacity: 0.65,
              textTransform: "uppercase",
              fontWeight: 700,
              letterSpacing: 0.6,
              fontSize: 12,
            }}
          >
            {title}
          </Text>
          <Title level={3} style={{ margin: 0, marginTop: 4, color: text }}>
            {formatNumber(value)}
          </Title>
        </div>
        <div
          style={{
            position: "relative",
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: primary,
            display: "grid",
            placeItems: "center",
          }}
        >
          <div
            style={{
              content: '""',
              position: "absolute",
              inset: -10,
              borderRadius: "50%",
              background: `radial-gradient(closest-side, ${primary}22, transparent 70%)`,
              zIndex: 0,
            }}
          />
          <div style={{ color: "#fff", fontSize: 22, zIndex: 1 }}>{icon}</div>
        </div>
      </div>
    </Card>
  );
}
