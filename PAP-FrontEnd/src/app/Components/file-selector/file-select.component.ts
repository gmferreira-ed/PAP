import { Component, inject, HostBinding, Input, input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ProgressComponent } from '../progress/progress.component';
import { HttpClient, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IconsModule } from '../icon/icon.component';

type UploadsProgress = { [key: string]: number }
type Images = { [key: string]:  string | null}
type FailedUploads = { [key: string]: boolean }

class UFile extends File {
  uid: string
  imagebase64: string|null|ArrayBuffer = null

  constructor(File: File) {
    super([File], File.name, { type: File.type });
    this.uid = File.name + Date.now()
  }
}


@Component({
  selector: 'file-select',
  imports: [ProgressComponent, CommonModule, IconsModule],

  templateUrl: 'file-select.component.html',
  styleUrl: 'file-select.component.less'
})


export class FileSelectComponent {

  @Input() Files: UFile[] = []
  @Output() FilesChange = new EventEmitter<UFile[]>();

  FailedUploads: FailedUploads = {}
  UploadsProgress: UploadsProgress = {}

  @Input() Multiple: boolean = false
  @Input() UploadDisplayMode: 'self' | 'none' = 'self'
  @Input() InputName: string = 'image'

  @Input() UploadAPI: string | null = null
  Uploading = false

  @Input() override:boolean = false
  @HostBinding('style.width') get width() {
    return this.override ? '100%' : null;
  }
  @HostBinding('style.height') get height() {
    return this.override ? '100%' : null;
  }

  HttpClient = inject(HttpClient)

  DestroyFile(File:UFile){
      const UIDToRemove = File.uid
      this.Files = this.Files.filter(file => file.uid != UIDToRemove);
      delete this.FailedUploads[UIDToRemove]
  }

  async OnFilesChange(event: Event, FileToReplace?:UFile) {
    const FilesList = (event.target as HTMLInputElement).files
    const Files: UFile[] = FilesList ? Array.from(FilesList).map((File) => { return new UFile(File) }) : [];

    // Clear data in case its single file only
    if (!this.Multiple){
      this.Files = []
      this.FailedUploads = {}
    }

    if (FileToReplace){
      const UIDToRemove = FileToReplace.uid
      this.Files = this.Files.filter(file => file.uid != UIDToRemove);
      delete this.FailedUploads[UIDToRemove]
    }

    for (const [index, File] of Files.entries()) {

      const FileUID = File.uid

      // Read the files on the client to preview
      const reader = new FileReader();
      reader.onload = () => {
        File.imagebase64 = reader.result
      }
      reader.readAsDataURL(File);


      // UPLOAD THE FILE
      if (this.UploadAPI) {
        this.Uploading = true

        const UploadData = new FormData();
        UploadData.append('thumbnail', File);

        const uploadReq = new HttpRequest('POST', this.UploadAPI, UploadData, {
          headers: new HttpHeaders(),
          reportProgress: true,
          withCredentials: true
        });


        this.HttpClient.request(uploadReq).subscribe({
          next: (event) => {
            const IsUploadProgress = event.type === HttpEventType.UploadProgress

            // Display the current progress
            if (IsUploadProgress) {
              const UploadTotal = event.total || 0
              const Progress = 100 * event.loaded / UploadTotal
              this.UploadsProgress[FileUID] = Progress


              // Remove uploads progress
            } else if (event.type === HttpEventType.Response) {
              delete this.UploadsProgress[FileUID]
              if (Object.keys(this.UploadsProgress).length == 0) {
                this.Uploading = false
              }
            }
          },
          error: (err) => {
            delete this.UploadsProgress[FileUID]
            this.FailedUploads[FileUID] = true
            console.log(err)
          },
          complete: () => {
            console.log('Upload process completed');
          }
        });
      }
    }

    this.Files = [...this.Files, ...Files]
    this.FilesChange.emit(this.Files)
  }
}

