export class UFile extends File {
  uid: string
  imagebase64: string|null|ArrayBuffer = null

  constructor(File: File) {
    super([File], File.name, { type: File.type });
    this.uid = File.name + Date.now()
  }
}
