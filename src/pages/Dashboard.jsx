import { useMemo, useState } from 'react'
import { Typography, Card, Flex, Row, Col, Spin, Segmented, theme, ConfigProvider } from 'antd'
import StatCard from '../components/statCard'
import {
  FileTextOutlined,
  LineChartOutlined,
  PieChartOutlined,
  UserOutlined,
} from '@ant-design/icons'
import useStatsFromCsv from '../hooks/useStatsFromCsv'
import EChart from '../components/EChart'

import { formatCompact, formatDateBR, formatNumberBR } from '../utils/formatters'
import useDataFromCSV from '../hooks/useDataFromCsv'
import useLeadersFromCsv from '../hooks/useLeadsFromCsv'

const { Title } = Typography

export default function Dashboard() {
  const { token } = theme.useToken()
  const csvUrl = new URL('../assets/parlamentares.csv', import.meta.url).href

  // KPIs
  const { error, loading, stats } = useStatsFromCsv(csvUrl)

  // Séries por dia
  const {
    dates,
    posts,
    interacoes,
    visualizacoes,
    loading: seriesLoading,
    error: seriesError,
  } = useDataFromCSV(csvUrl)

  const {
    topLabels,
    topInteracoes,
    points,
    hasLikesComments,
    loading: leadersLoading,
    error: leadersError,
  } = useLeadersFromCsv(csvUrl, 10)

  // Opções do Segmented (só mostra Visualizações se existir no CSV)
  const segmentedOptions = useMemo(() => {
    const base = [
      { value: 'posts', label: <Label icon={<FileTextOutlined />} text="Posts" /> },
      { value: 'interacoes', label: <Label icon={<PieChartOutlined />} text="Interações" /> },
    ]
    if (visualizacoes) {
      base.push({
        value: 'visualizacoes',
        label: <Label icon={<LineChartOutlined />} text="Visualizações" />,
      })
    }
    return base
  }, [visualizacoes])

  const [metric, setMetric] = useState(segmentedOptions[0]?.value ?? 'posts')

  // option do ECharts (datas e números formatados)
  const option = useMemo(() => {
    const seriesData =
      metric === 'posts' ? posts : metric === 'interacoes' ? interacoes : visualizacoes || []

    return {
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          formatter: (v) => formatDateBR(v),
          fontSize: 14,
          color: token.colorTextSecondary,
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (v) => formatCompact(v),
          fontSize: 14,
          color: token.colorTextSecondary,
        },
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          const p = params[0]
          return `${formatDateBR(p.axisValue)}<br/><b>${titleFor(metric)}:</b> ${formatNumberBR(
            p.value
          )}`
        },
      },
      series: [
        {
          name: titleFor(metric),
          type: 'line',
          smooth: true,
          areaStyle: {},
          symbolSize: 8,
          data: seriesData,
        },
      ],
    }
  }, [dates, posts, interacoes, visualizacoes, metric, token.colorTextSecondary])

  const optionTopAccounts = useMemo(
    () => ({
      grid: { left: 120, right: 16, top: 16, bottom: 32, containLabel: true },
      xAxis: {
        type: 'value',
        axisLabel: {
          formatter: (v) => formatCompact(v),
          color: token.colorTextSecondary,
          fontSize: 14,
        },
        splitLine: { show: true },
      },
      yAxis: {
        type: 'category',
        data: topLabels,
        axisLabel: { color: token.colorText, fontSize: 14 },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (p) => {
          const item = p[0]
          return `<b>${item.name}</b><br/>Interações: ${formatNumberBR(item.value)}`
        },
      },
      series: [
        {
          name: 'Interações',
          type: 'bar',
          data: topInteracoes,
          barWidth: 18,
          emphasis: { focus: 'series' },
        },
      ],
    }),
    [topLabels, topInteracoes, token.colorTextSecondary, token.colorText]
  )

  const optionLeaders = useMemo(
    () => ({
      grid: { left: 60, right: 24, top: 40, bottom: 48, containLabel: true },
      xAxis: {
        type: 'value',
        name: hasLikesComments ? 'Curtidas' : 'Visualizações',
        axisLabel: {
          formatter: (v) => formatCompact(v),
          color: token.colorTextSecondary,
          fontSize: 14,
        },
        splitLine: { show: true },
      },
      yAxis: {
        type: 'value',
        name: hasLikesComments ? 'Comentários' : 'Interações',
        axisLabel: {
          formatter: (v) => formatCompact(v),
          color: token.colorTextSecondary,
          fontSize: 14,
        },
        splitLine: { show: true },
      },
      tooltip: {
        trigger: 'item',
        formatter: (p) => {
          const [x, y] = p.value
          const xLbl = hasLikesComments ? 'Curtidas' : 'Visualizações'
          const yLbl = hasLikesComments ? 'Comentários' : 'Interações'
          return `<b>${p.name}</b><br/>${xLbl}: ${formatNumberBR(x)}<br/>${yLbl}: ${formatNumberBR(y)}`
        },
      },
      series: [
        {
          type: 'scatter',
          name: 'Contas',
          data: points,
          symbolSize: 10,
          emphasis: {
            focus: 'self',
            label: { show: true, formatter: ({ name }) => name, position: 'top' },
          },
        },
      ],
    }),
    [points, hasLikesComments, token.colorTextSecondary]
  )

  return (
    <>
      {error && <div style={{ color: 'red' }}>Erro ao ler CSV: {String(error)}</div>}
      <Title level={3}>Painel Analítico</Title>
      {/* KPIs */}
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
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            loading={loading}
            title="Visualizações"
            value={stats.visualizacoes}
            icon={<LineChartOutlined />}
          />
        </Col>
      </Row>
      {/* Segmented + Gráfico abaixo */}
      {seriesError ? (
        <div style={{ color: 'red' }}>Erro: {String(seriesError)}</div>
      ) : (
        <Flex gap={16} wrap style={{ marginTop: 30 }}>
          <Card style={{ flex: 1, minWidth: 300 }}>
            <ConfigProvider
              theme={{
                components: {
                  Segmented: {
                    itemSelectedBg: token.colorPrimaryBgHover,
                    itemHoverBg: token.colorPrimaryBg,
                    itemSelectedColor: token.colorText,
                    trackBg: token.colorBgContainer,
                  },
                },
              }}
            >
              <Segmented
                options={segmentedOptions}
                value={metric}
                onChange={setMetric}
                size="large"
                block
                style={{ marginBottom: 16 }}
              />
            </ConfigProvider>

            {seriesLoading ? <Spin /> : <EChart option={option} height={360} />}
          </Card>
        </Flex>
      )}
      {leadersError ? (
        <div style={{ color: 'red' }}>Erro ao ler CSV: {String(leadersError)}</div>
      ) : (
        <Row style={{ marginTop: 30 }} gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card>
              <Title level={3} style={{ marginBottom: 8 }}>
                Contas com mais interações
              </Title>
              <div style={{ marginTop: -8, color: token.colorTextSecondary }}>
                Soma de curtidas, comentários e compartilhamentos (ou equivalente)
              </div>
              {leadersLoading ? <Spin /> : <EChart option={optionTopAccounts} height={420} />}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card>
              <Title level={3} style={{ marginBottom: 8 }}>
                Lideranças nas redes
              </Title>
              <div style={{ marginTop: -8, color: token.colorTextSecondary }}>
                Comparação de{' '}
                {hasLikesComments ? 'curtidas e comentários' : 'visualizações e interações'}
              </div>
              {leadersLoading ? <Spin /> : <EChart option={optionLeaders} height={420} />}
            </Card>
          </Col>
        </Row>
      )}
    </>
  )
}

function Label({ icon, text }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      {icon} {text}
    </span>
  )
}

function titleFor(metric) {
  if (metric === 'interacoes') return 'Interações'
  if (metric === 'visualizacoes') return 'Visualizações'
  return 'Posts'
}
