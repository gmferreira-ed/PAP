export interface PermissionInfo {
  Enabled?: boolean, // Just for easier switch component manipulation
  Changing?: boolean,
  PermissionType: string,
  Summary: string,
  PermissionLevels: string[]
}

export interface UserRole{
  name:string
  administrator:boolean
  permission_level:number
  locked?:boolean
}

export interface EndpointData {
  ID: string,
  DisplayName: string,
  Category: string,
  Summary: string,
  Changing?:boolean
  PermissionLevels: any[]
}

export interface EndpointCategory {
  Category: string,
  Endpoints: EndpointData[]
}