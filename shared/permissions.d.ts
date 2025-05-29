export interface PermissionInfo {
  Enabled?: boolean, // Just for easier switch component manipulation
  Changing?: boolean,
  TypeLabel?:string,  
  PermissionType: string,
  Summary: string,
  PermissionLevels: string[]
}

export interface EndpointData {
  Endpoint: string,
  DisplayName: string,
  Category: string,
  TypeLabel?:string,
  Summary: string,
  PermissionTypes: PermissionInfo[]
}

export interface EndpointCategory {
  Category: string,
  Endpoints: EndpointData[]
}