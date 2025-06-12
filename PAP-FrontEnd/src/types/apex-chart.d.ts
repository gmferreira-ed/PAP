import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexPlotOptions,
  ApexFill,
  ApexStroke,
  ApexGrid,
  ApexLegend,
  ApexTooltip,
  ApexAnnotations,
  ApexMarkers, // fixed import
  ApexResponsive,
  ApexTheme
} from 'ng-apexcharts';

export type ApexChartOptions = {
  series: ApexAxisChartSeries | number[];
  chart: ApexChart;
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis | ApexYAxis[];
  title?: ApexTitleSubtitle;
  dataLabels?: ApexDataLabels;
  plotOptions?: ApexPlotOptions;
  fill?: ApexFill;
  stroke?: ApexStroke;
  grid?: ApexGrid;
  markers?: ApexMarkers;
  legend?: ApexLegend;
  labels?: string[]; // fixed type
  tooltip?: ApexTooltip;
  annotations?: ApexAnnotations;
  colors?: any[];
  subtitle?: ApexTitleSubtitle; // added
  theme?: ApexTheme; // added
  responsive?: ApexResponsive[]; // added
};
