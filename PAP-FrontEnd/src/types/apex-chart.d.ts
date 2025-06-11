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
  ApexAnnotations,       // ← Use this instead
} from 'ng-apexcharts';

export type ApexChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis | ApexYAxis[];
  title?: ApexTitleSubtitle;
  dataLabels?: ApexDataLabels;
  plotOptions?: ApexPlotOptions;
  fill?: ApexFill;
  stroke?: ApexStroke;
  grid?: ApexGrid;
  legend?: ApexLegend;
  tooltip?: ApexTooltip;
  annotations?: ApexAnnotations;  // ← Add this
};
