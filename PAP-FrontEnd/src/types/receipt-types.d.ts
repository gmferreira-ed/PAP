type PrinterFunctionName = 'text' | 'align' | 'drawLine' | 'image'
type TextAlign = 'LT' | 'CT' | 'RT';
type TextFontSize = 0 | 1 | 2 | 'NORMAL';
type TextStyle = 'B' | 'U' | 'I' | 'BU' | 'BI' | 'UI' | 'UBI' | 'NORMAL';
type TextFont = 'A' | 'B'

type TextSettings = {
  align: TextAlign,
  size: [TextFontSize, TextFontSize],
  style: TextStyle,
  font: TextFont,
  justified: boolean,
}