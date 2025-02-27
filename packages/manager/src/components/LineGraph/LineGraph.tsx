import {
  Chart,
  ChartData,
  ChartDataSets,
  ChartOptions,
  ChartTooltipItem,
  ChartXAxe,
} from 'chart.js';
import 'chartjs-adapter-luxon';
import { curry } from 'ramda';
import * as React from 'react';
import { useTheme, Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AccessibleGraphData from './AccessibleGraphData';
import { Typography } from 'src/components/Typography';
import { TableRow } from 'src/components/TableRow';
import { TableCell } from 'src/components/TableCell';
import { setUpCharts } from 'src/utilities/charts';
import roundTo from 'src/utilities/roundTo';
import { Metrics } from 'src/utilities/statMetrics';
import {
  StyledButton,
  StyledButtonElement,
  StyledCanvasContainer,
  StyledContainer,
  StyledTable,
  StyledTableBody,
  StyledTableCell,
  StyledTableHead,
  StyledWrapper,
} from './LineGraph.styles';

setUpCharts();

export interface DataSet {
  label: string;
  borderColor: string;
  // this data property type might not be the perfect fit, but it works for
  // the data returned from /linodes/:linodeID/stats and
  // /nodebalancers/:nodebalancer/stats
  // the first number will be a UTC data and the second will be the amount per second
  fill?: boolean | string;
  backgroundColor?: string;
  data: [number, number | null][];
}
export interface LineGraphProps {
  chartHeight?: number;
  showToday: boolean;
  suggestedMax?: number;
  data: DataSet[];
  timezone: string;
  rowHeaders?: Array<string>;
  legendRows?: Array<any>;
  unit?: string;
  /**
   * `accessibleDataTable` is responsible to both rendering the accessible graph data table and an associated unit.
   */
  accessibleDataTable?: {
    unit: string;
  };
  nativeLegend?: boolean; // Display chart.js native legend
  formatData?: (value: number) => number | null;
  formatTooltip?: (value: number) => string;
  ariaLabel?: string;
  tabIndex?: number;
}

const lineOptions: ChartDataSets = {
  borderWidth: 1,
  borderJoinStyle: 'miter',
  lineTension: 0,
  pointRadius: 0,
  pointHitRadius: 10,
};

const humanizeLargeData = (value: number) => {
  if (value >= 1000000) {
    return value / 1000000 + 'M';
  }
  if (value >= 1000) {
    return value / 1000 + 'K';
  }
  return value;
};

export const LineGraph = (props: LineGraphProps) => {
  const theme = useTheme<Theme>();
  const matchesSmDown = useMediaQuery(theme.breakpoints.down('md'));

  const inputEl: React.RefObject<any> = React.useRef(null);
  const chartInstance: React.MutableRefObject<any> = React.useRef(null);
  const [legendRendered, setLegendRendered] = React.useState(false);
  const [hiddenDatasets, setHiddenDatasets] = React.useState<number[]>([]);

  const {
    ariaLabel,
    chartHeight,
    formatData,
    formatTooltip,
    suggestedMax,
    showToday,
    timezone,
    data,
    rowHeaders,
    legendRows,
    nativeLegend,
    tabIndex,
    unit,
    accessibleDataTable,
  } = props;

  const finalRowHeaders = rowHeaders ? rowHeaders : ['Max', 'Avg', 'Last'];
  // is undefined on linode/summary
  const plugins = [
    {
      afterDatasetsDraw: () => {
        // hack to force re-render component in order to show legend
        // tested this is called
        if (!legendRendered) {
          setLegendRendered(true);
        }
      },
    },
  ];

  const handleLegendClick = (datasetIndex: number) => {
    if (hiddenDatasets.includes(datasetIndex)) {
      setHiddenDatasets(hiddenDatasets.filter((e) => e !== datasetIndex));
    } else {
      setHiddenDatasets([...hiddenDatasets, datasetIndex]);
    }
  };

  const getChartOptions = (
    _suggestedMax?: number,
    _nativeLegend?: boolean,
    _tooltipUnit?: string
  ) => {
    const finalChartOptions: ChartOptions = {
      maintainAspectRatio: false,
      responsive: true,
      animation: { duration: 0 },
      legend: {
        display: _nativeLegend,
        position: _nativeLegend ? 'bottom' : undefined,
      },
      scales: {
        yAxes: [
          {
            // Defines a fixed width for the Y-axis labels
            afterFit(axes) {
              axes.width = 35;
            },
            gridLines: {
              borderDash: [3, 6],
              drawTicks: false,
              zeroLineWidth: 1,
              zeroLineBorderDashOffset: 2,
            },
            ticks: {
              beginAtZero: true,
              fontColor: theme.textColors.tableHeader,
              fontSize: 12,
              fontStyle: 'normal',
              maxTicksLimit: 8,
              padding: 10,
              suggestedMax: _suggestedMax ?? undefined,
              callback(value: number, _index: number) {
                return humanizeLargeData(value);
              },
            },
          },
        ],
        xAxes: [
          {
            type: 'time',
            gridLines: {
              display: false,
            },
            time: {
              stepSize: showToday ? 3 : 5,
              displayFormats: showToday
                ? {
                    hour: 'HH:00',
                    minute: 'HH:mm',
                  }
                : {
                    hour: 'LLL dd',
                    minute: 'LLL dd',
                  },
            },
            adapters: {
              date: {
                zone: timezone,
              },
            },
            ticks: {
              fontColor: theme.textColors.tableHeader,
              fontSize: 12,
              fontStyle: 'normal',
            },
            // This cast is because the type definition does not include adapters
          } as ChartXAxe,
        ],
      },
      tooltips: {
        cornerRadius: 0,
        backgroundColor: '#fbfbfb',
        bodyFontColor: '#32363C',
        displayColors: false,
        titleFontColor: '#606469',
        xPadding: 8,
        yPadding: 10,
        borderWidth: 0.5,
        borderColor: '#999',
        caretPadding: 10,
        position: 'nearest',
        callbacks: {
          label: _formatTooltip(data, formatTooltip, _tooltipUnit),
        },
        intersect: false,
        mode: 'index',
      },
    };

    /**
     * We've been given a max unit, which indicates that
     * the data we're looking at is in bytes. We should
     * adjust the tooltip display so that if the maxUnit is GB we
     * display 8MB instead of 0.0000000000000000000000008 GB
     *
     * NOTE: formatTooltip is curried, so here we're creating a new
     * function has the raw data from props bound to it. This is because
     * we need to access the original data to determine what unit to display
     * it in.
     *
     * NOTE2: _maxUnit is the unit that all series on the graph will be converted to.
     * However, in the tooltip, each individual value will be formatted according to
     * the most appropriate unit, if a unit is provided.
     */

    return finalChartOptions as ChartOptions;
  };

  const _formatData = () => {
    return data.map((dataSet, idx) => {
      const timeData = dataSet.data.reduce((acc: any, point: any) => {
        acc.push({
          t: point[0],
          y: formatData ? formatData(point[1]) : point[1],
        });
        return acc;
      }, []);
      return {
        label: dataSet.label,
        borderColor: dataSet.borderColor,
        backgroundColor: dataSet.backgroundColor,
        data: timeData,
        fill: dataSet.fill,
        hidden: hiddenDatasets.includes(idx),
        ...lineOptions,
      };
    });
  };

  React.useEffect(() => {
    // Here we need to wait for the Canvas element to exist to attach a chart to it
    // we use a reference to access it.
    // https://dev.to/vcanales/using-chart-js-in-a-function-component-with-react-hooks-246l
    if (inputEl.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(inputEl.current.getContext('2d'), {
        type: 'line',
        data: {
          datasets: _formatData(),
        },
        plugins,
        options: getChartOptions(suggestedMax, nativeLegend, unit),
      });
    }
  });

  const sxTypography = {
    fontSize: '0.75rem',
  };

  const sxTypographyHeader = {
    ...sxTypography,
    color: theme.textColors.tableHeader,
  };

  const sxLegend = {
    [theme.breakpoints.up('md')]: {
      width: '38%',
    },
  };

  return (
    // Allow `tabIndex` on `<div>` because it represents an interactive element.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex

    // Note on markup and styling: the legend is rendered first for accessibility reasons.
    // Screen readers read from top to bottom, so the legend should be read before the data tables, esp considering their size
    // and the fact that the legend can filter them.
    // Meanwhile the CSS uses column-reverse to visually retain the original order
    <StyledWrapper tabIndex={tabIndex ?? 0}>
      {legendRendered && legendRows && (
        <StyledContainer>
          <StyledTable
            aria-label={`Controls for ${ariaLabel || 'Stats and metrics'}`}
            noBorder
          >
            <StyledTableHead>
              {/* Repeat legend for each data set for mobile */}
              {matchesSmDown ? (
                data.map((section) => (
                  <TableRow key={section.label}>
                    {finalRowHeaders.map((section, i) => (
                      <TableCell key={i} data-qa-header-cell>
                        <Typography variant="body1" sx={sxTypographyHeader}>
                          {section}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    sx={{
                      /**
                       * TODO: TableCell needs to be refactored before
                       * we can remove this !important
                       */
                      height: '26px !important',
                    }}
                  />
                  {finalRowHeaders.map((section, i) => (
                    <TableCell key={i} data-qa-header-cell>
                      <Typography variant="body1" sx={sxTypographyHeader}>
                        {section}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              )}
            </StyledTableHead>
            <StyledTableBody>
              {legendRows?.map((_tick: any, idx: number) => {
                const bgColor = data[idx].backgroundColor;
                const title = data[idx].label;
                const hidden = hiddenDatasets.includes(idx);
                const { data: metricsData, format } = legendRows[idx];
                return (
                  <TableRow key={idx}>
                    <StyledTableCell sx={sxLegend} noWrap>
                      <StyledButton
                        onClick={() => handleLegendClick(idx)}
                        data-qa-legend-title
                        aria-label={`Toggle ${title} visibility`}
                      >
                        <StyledButtonElement
                          hidden={hidden}
                          sx={{
                            background: bgColor,
                            borderColor: bgColor,
                            borderStyle: 'solid',
                            borderWidth: '1px',
                            height: '18px',
                            marginRight: theme.spacing(1),
                            width: '18px',
                          }}
                        />
                        <StyledButtonElement hidden={hidden}>
                          {title}
                        </StyledButtonElement>
                      </StyledButton>
                    </StyledTableCell>
                    {metricsData &&
                      metricsBySection(metricsData).map((section, i) => {
                        return (
                          <StyledTableCell
                            key={i}
                            parentColumn={
                              rowHeaders ? rowHeaders[idx] : undefined
                            }
                            data-qa-body-cell
                          >
                            <Typography
                              variant="body1"
                              sx={{ ...sxTypography, color: theme.color.black }}
                            >
                              {format(section)}
                            </Typography>
                          </StyledTableCell>
                        );
                      })}
                  </TableRow>
                );
              })}
            </StyledTableBody>
          </StyledTable>
        </StyledContainer>
      )}
      <StyledCanvasContainer>
        <canvas
          height={chartHeight || 300}
          ref={inputEl}
          role="img"
          aria-label={ariaLabel || 'Stats and metrics'}
        />
      </StyledCanvasContainer>
      {accessibleDataTable?.unit && (
        <AccessibleGraphData
          chartInstance={chartInstance.current}
          ariaLabel={ariaLabel}
          hiddenDatasets={hiddenDatasets}
          accessibleUnit={accessibleDataTable.unit}
        />
      )}
    </StyledWrapper>
  );
};

// Grabs the sections we want (max, average, last) and puts them in an array
// so we can map through them and create JSX
export const metricsBySection = (data: Metrics): number[] => [
  data.max,
  data.average,
  data.last,
];

export const _formatTooltip = curry(
  (
    data: DataSet[],
    formatter: ((v: number) => string) | undefined,
    unit: string | undefined,
    t: ChartTooltipItem,
    _d: ChartData
  ) => {
    /**
     * t and d are the params passed by chart.js to this component.
     * data and formatter should be partially applied before this function
     * is called directly by chart.js
     */
    const dataset = t?.datasetIndex ? data[t?.datasetIndex] : data[0];
    const label = dataset.label;
    const val = t?.index ? dataset.data[t?.index][1] || 0 : 0;
    const value = formatter ? formatter(val) : roundTo(val);
    return `${label}: ${value}${unit ? unit : ''}`;
  }
);
