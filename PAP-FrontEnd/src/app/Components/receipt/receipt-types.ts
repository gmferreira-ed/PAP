



const DefaultSettings: TextSettings = {
  align: 'LT',
  size: ['NORMAL', 'NORMAL'],
  style: 'NORMAL',
  font: 'A',
  justified: false
}
var CurrentSettings = DefaultSettings



export class TextData {
  align: TextAlign;
  size: [TextFontSize, TextFontSize];
  style: TextStyle;
  font: TextFont;
  text: string;
  justified: boolean;

  constructor(
    text: string,
    text_settings: Partial<TextSettings> = {}
  ) {
    const settings: TextSettings = {
      ...DefaultSettings,
      ...text_settings
    };

    this.text = text
    this.align = settings.align
    this.size = settings.size
    this.style = settings.style
    this.font = settings.font
    this.justified = settings.justified
  }
}

export class PrinterFunction {
  name: PrinterFunctionName
  data?: PrinterFunctionData

  constructor(name: PrinterFunctionName, data?: PrinterFunctionData) {
    this.name = name
    this.data = data

    if (name == 'align') {
      CurrentSettings.align = data as TextAlign
    }
  }

  isTextData(): this is PrinterFunction & { data: TextData } {
    return this.name === 'text';
  }
}


export class ImageInfo {
  width: number
  height: number
  data: Uint8Array<ArrayBuffer>

  constructor(width: number, height: number, data: Uint8Array<ArrayBuffer>) {
    this.width = width
    this.height = height
    this.data = data
  }
}
type PrinterFunctionData = string | TextData | ImageInfo
