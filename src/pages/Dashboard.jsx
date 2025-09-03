import { useEffect, useMemo, useState } from 'react'
import {
  Typography,
  Card,
  Flex,
  Row,
  Col,
  Spin,
  Segmented,
  theme,
  ConfigProvider,
  Table,
  Input,
  Progress,
} from 'antd'
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
import useLeadersFromCsv from '../hooks/useLeadersFromCsv'
import useRowsFromCsv from '../hooks/useRowsFromCsv'

const { Title, Paragraph } = Typography

export default function Dashboard() {
  const [pageSize, setPageSize] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)
  const { token } = theme.useToken()
  const csvUrl = new URL('../assets/parlamentares.csv', import.meta.url).href

  // KPIs
  const { error, loading, stats } = useStatsFromCsv(csvUrl)

  // Série temporal
  const {
    dates,
    posts,
    interacoes,
    visualizacoes,
    loading: seriesLoading,
    error: seriesError,
  } = useDataFromCSV(csvUrl)

  // Cabeças de rede (Top contas + Scatter)
  const {
    topLabels,
    topInteracoes,
    points,
    hasLikesComments,
    loading: leadersLoading,
    error: leadersError,
  } = useLeadersFromCsv(csvUrl, 10)

  // Dados brutos para a Tabela
  const { rows, loading: tableLoading, error: tableError } = useRowsFromCsv(csvUrl)

  // Opções do Segmented
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

  // Linha temporal (ECharts)
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

  // Top contas (barra horizontal)
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

  // Scatter (lideranças)
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

  // ---------- TABELA DE PUBLICAÇÕES ----------

  // filtros de coluna
  const [filters, setFilters] = useState({
    Nome: '',
    Ideologia: '',
    Cargo: '',
    Partido: '',
    Estado: '',
    Dia: '',
    Texto: '',
    Plataforma: '',
  })

  // ===== helpers e mapeamento dinâmico de colunas =====
  const norm = (s) =>
    (s ?? '')
      .toString()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()

  const headers = useMemo(() => (rows[0] ? Object.keys(rows[0]) : []), [rows])

  const colMap = useMemo(() => {
    const find = (...needles) =>
      headers.find((h) => {
        const n = norm(h)
        return needles.some((k) => n.includes(norm(k)))
      })

    return {
      nome: find('usuario', 'perfil', 'autor', 'conta', 'nome') || 'Nome',
      ideologia: find('categoria') || find('ideologia') || 'Categoria',
      cargo: find('cargo') || 'Cargo',
      partido: find('partido', 'sigla do partido') || 'Partido',
      estado: find('estado', 'uf') || 'Estado',
      dia: find('dia', 'data', 'data de criacao', 'data de criação') || 'Dia',
      texto: find('texto', 'legenda', 'caption', 'descricao', 'descrição') || 'Texto',
      inter: find('intera', 'total de intera', 'interacoes', 'interações') || 'Interações',
      url: find('url', 'link') || 'URL',
      plataforma: find('url', 'link') || 'URL',
    }
  }, [headers])

  const toNum = (v) => {
    const s = (v ?? '')
      .toString()
      .replace(/\u00A0/g, ' ') // NBSP
      .replace(/\s/g, '') // remove espaços
      .replace(/\./g, '') // milhar
      .replace(',', '.') // decimal
    const n = Number(s)
    return Number.isFinite(n) ? n : 0
  }

  const platformFromUrl = (url) => {
    const u = (url || '').toString().toLowerCase()
    if (u.includes('instagram.com')) return 'Instagram'
    if (u.includes('tiktok.com')) return 'Tiktok'
    if (u.includes('x.com') || u.includes('twitter.com')) return 'X/Twitter'
    if (u.includes('youtube.com') || u.includes('youtu.be')) return 'YouTube'
    if (u.includes('facebook.com')) return 'Facebook'
    return '—'
  }

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const plataforma = platformFromUrl(r[colMap.url])
      return Object.entries({
        [colMap.nome]: filters.Nome,
        [colMap.ideologia]: filters.Ideologia,
        [colMap.cargo]: filters.Cargo,
        [colMap.partido]: filters.Partido,
        [colMap.estado]: filters.Estado,
        [colMap.dia]: filters.Dia,
        [colMap.texto]: filters.Texto,
        Plataforma: filters.Plataforma, // aqui testamos manual
      }).every(([col, val]) => {
        if (!val) return true
        if (col === 'Plataforma') {
          return plataforma.toLowerCase().includes(val.toLowerCase())
        }
        return String(r[col] ?? '')
          .toLowerCase()
          .includes(val.toLowerCase())
      })
    })
  }, [rows, filters, colMap])

  const maxInter = useMemo(() => {
    if (!filteredRows.length) return 0
    return Math.max(...filteredRows.map((r) => toNum(r[colMap.inter])), 0)
  }, [filteredRows, colMap])

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
    if (currentPage > totalPages) setCurrentPage(totalPages)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredRows.length, pageSize])

  // colunas da tabela
  const columns = useMemo(
    () => [
      {
        title: 'Nome',
        dataIndex: colMap.nome,
        width: 180,
        fixed: 'left',
        onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
        sorter: (a, b) => String(a[colMap.nome] || '').localeCompare(String(b[colMap.nome] || '')),
        filterDropdown: () => (
          <Input
            placeholder="Filtrar"
            value={filters.Nome}
            onChange={(e) => setFilters((f) => ({ ...f, Nome: e.target.value }))}
            allowClear
          />
        ),
      },
      {
        title: 'Ideologia',
        dataIndex: colMap.ideologia,
        width: 110,
        onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
        filterDropdown: () => (
          <Input
            placeholder="Filtrar"
            value={filters.Ideologia}
            onChange={(e) => setFilters((f) => ({ ...f, Ideologia: e.target.value }))}
            allowClear
          />
        ),
      },
      {
        title: 'Cargo',
        dataIndex: colMap.cargo,
        width: 150,
        onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
        filterDropdown: () => (
          <Input
            placeholder="Filtrar"
            value={filters.Cargo}
            onChange={(e) => setFilters((f) => ({ ...f, Cargo: e.target.value }))}
            allowClear
          />
        ),
      },
      {
        title: 'Partido',
        dataIndex: colMap.partido,
        width: 90,
        onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
        filterDropdown: () => (
          <Input
            placeholder="Filtrar"
            value={filters.Partido}
            onChange={(e) => setFilters((f) => ({ ...f, Partido: e.target.value }))}
            allowClear
          />
        ),
      },
      {
        title: 'Estado',
        dataIndex: colMap.estado,
        width: 90, // um pouco mais largo para não quebrar
        onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
        filterDropdown: () => (
          <Input
            placeholder="UF"
            value={filters.Estado}
            onChange={(e) => setFilters((f) => ({ ...f, Estado: e.target.value }))}
            allowClear
          />
        ),
      },
      {
        title: 'Dia',
        dataIndex: colMap.dia,
        width: 120,
        onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
        sorter: (a, b) => new Date(a[colMap.dia]) - new Date(b[colMap.dia]),
        filterDropdown: () => (
          <Input
            placeholder="YYYY-MM-DD"
            value={filters.Dia}
            onChange={(e) => setFilters((f) => ({ ...f, Dia: e.target.value }))}
            allowClear
          />
        ),
      },
      {
        title: 'Texto',
        dataIndex: colMap.texto,
        width: 440,
        render: (text) => (
          <Paragraph
            ellipsis={{ rows: 2, tooltip: text }}
            style={{ margin: 0, whiteSpace: 'pre-wrap' }}
          >
            {text}
          </Paragraph>
        ),
        filterDropdown: () => (
          <Input
            placeholder="Buscar no texto"
            value={filters.Texto}
            onChange={(e) => setFilters((f) => ({ ...f, Texto: e.target.value }))}
            allowClear
          />
        ),
      },
      {
        title: 'Interações',
        dataIndex: colMap.inter,
        width: 170,
        align: 'right',
        defaultSortOrder: 'descend',
        onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
        sorter: (a, b) => toNum(a[colMap.inter]) - toNum(b[colMap.inter]),
        render: (_, r) => {
          const num = toNum(r[colMap.inter])
          const pct = maxInter ? (num / maxInter) * 100 : 0
          const pctCapped = Math.min(99.9, pct) // evita 100% => verde

          return (
            <div style={{ width: '100%' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}
              >
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatNumberBR(num)}</span>
              </div>
              <div style={{ marginTop: 4 }}>
                <Progress percent={pctCapped} showInfo={false} size="small" status="normal" />
              </div>
            </div>
          )
        },
      },

      {
        title: 'URL',
        dataIndex: colMap.url,
        width: 90,
        fixed: 'right',
        onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
        render: (v) =>
          v ? (
            <a href={v} target="_blank" rel="noopener noreferrer">
              Link
            </a>
          ) : null,
      },
      {
        title: 'Plataforma',
        dataIndex: colMap.url,
        width: 120,
        onHeaderCell: () => ({ style: { whiteSpace: 'nowrap' } }),
        render: (url) => platformFromUrl(url),
        filterDropdown: () => (
          <Input
            placeholder="Filtrar"
            value={filters.Plataforma}
            onChange={(e) => setFilters((f) => ({ ...f, Plataforma: e.target.value }))}
            allowClear
          />
        ),
      },
    ],
    [filters, maxInter, colMap]
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

      {/* Série temporal */}
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

      {/* Cabeças de rede */}
      <Title level={4} style={{ marginTop: 32 }}>
        CABEÇAS DE REDE
      </Title>
      {leadersError && <div style={{ color: 'red' }}>Erro ao ler CSV: {String(leadersError)}</div>}

      <Row gutter={[16, 16]}>
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

      {/* TABELA DE PUBLICAÇÕES */}
      <Title level={4} style={{ marginTop: 30 }}>
        TABELA DE PUBLICAÇÕES
      </Title>
      {tableError && <div style={{ color: 'red' }}>Erro: {String(tableError)}</div>}

      {tableLoading ? (
        <Spin />
      ) : (
        <Table
          className="dashboard-table"
          columns={columns}
          style={{ minHeight: 520 }}
          dataSource={filteredRows}
          rowKey={(r, i) => i}
          size="small"
          bordered
          tableLayout="fixed"
          scroll={{ x: 1550, y: 520 }}
          sticky
          pagination={{
            current: currentPage,
            pageSize,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            onChange: (page, size) => {
              setCurrentPage(page)
              setPageSize(size)
            },
            position: ['bottomRight'],
          }}
        />
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
