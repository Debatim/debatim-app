import * as echarts from 'echarts'

export function registerEchartsThemeFromAntd(token) {
  const {
    colorText,
    colorTextSecondary,
    colorPrimary,
    colorBorderSecondary,
    colorSplit,
    fontFamily,
    fontSize,
    colorBgContainer,
  } = token

  const AXIS_FONT = Math.max(14, (fontSize || 14) + 0)
  const LEGEND_FONT = Math.max(13, (fontSize || 14) - 1)
  const TITLE_FONT = Math.max(16, (fontSize || 14) + 2)

  const themeName = `deb-theme-${colorPrimary}-${colorBgContainer}-${AXIS_FONT}`

  const theme = {
    // Fonte e cores base
    textStyle: {
      color: colorText,
      fontFamily: fontFamily || 'inherit',
    },

    // Título
    title: {
      textStyle: { color: colorText, fontSize: TITLE_FONT, fontWeight: 600 },
      subtextStyle: { color: colorTextSecondary, fontSize: LEGEND_FONT },
    },

    // Cores das séries (paleta)
    color: [
      colorPrimary,
      token.colorSuccess,
      token.colorWarning,
      token.colorError,
      token.colorInfo,
      colorTextSecondary,
    ].filter(Boolean),

    // Tooltip
    tooltip: {
      backgroundColor: colorBgContainer,
      borderColor: colorBorderSecondary,
      textStyle: { color: colorText, fontSize: LEGEND_FONT },
      axisPointer: {
        lineStyle: { color: colorPrimary },
        crossStyle: { color: colorPrimary },
        label: { color: colorText, backgroundColor: colorBgContainer },
      },
    },

    // Legenda
    legend: {
      textStyle: { color: colorText, fontSize: LEGEND_FONT },
    },

    // Grade (margens internas)
    grid: { top: 36, right: 20, bottom: 36, left: 56 },

    // Eixos categoria (x) e valor (y)
    categoryAxis: {
      axisLine: { lineStyle: { color: colorBorderSecondary } },
      axisTick: { lineStyle: { color: colorBorderSecondary } },
      axisLabel: { color: colorText, fontSize: AXIS_FONT },
      splitLine: { show: false },
      nameTextStyle: { color: colorTextSecondary, fontSize: AXIS_FONT },
    },
    valueAxis: {
      axisLine: { lineStyle: { color: colorBorderSecondary } },
      axisTick: { lineStyle: { color: colorBorderSecondary } },
      axisLabel: { color: colorText, fontSize: AXIS_FONT },
      splitLine: { lineStyle: { color: colorSplit } },
      nameTextStyle: { color: colorTextSecondary, fontSize: AXIS_FONT },
    },

    // Séries comuns
    line: {
      symbolSize: 6,
      lineStyle: { width: 2 },
      areaStyle: { opacity: 0.15 },
    },
    bar: {
      itemStyle: { borderRadius: [4, 4, 0, 0] },
    },
    pie: {
      label: { color: colorText, fontSize: LEGEND_FONT },
      labelLine: { lineStyle: { color: colorBorderSecondary } },
    },

    // VisualMap, DataZoom, etc.
    dataZoom: {
      textStyle: { color: colorTextSecondary },
      borderColor: colorBorderSecondary,
      brushStyle: { color: `${colorPrimary}33` },
      handleStyle: { color: colorPrimary },
    },
  }

  echarts.registerTheme(themeName, theme)
  return themeName
}
