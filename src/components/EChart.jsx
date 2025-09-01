import ReactECharts from 'echarts-for-react'
import { theme as antdTheme } from 'antd'
import { useMemo } from 'react'
import { registerEchartsThemeFromAntd } from '../charts/registerEchartsTheme'

export default function EChart({ option, height = 320 }) {
  const { token } = antdTheme.useToken()

  const themeName = useMemo(() => registerEchartsThemeFromAntd(token), [token])

  const merged = useMemo(
    () => ({
      backgroundColor: 'transparent',
      ...option,
    }),
    [option]
  )

  return (
    <ReactECharts
      option={merged}
      style={{ height, width: '100%' }}
      notMerge
      lazyUpdate
      theme={themeName}
    />
  )
}
