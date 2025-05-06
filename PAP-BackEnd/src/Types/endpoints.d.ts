
// Hard coded info
interface EndpointAttributes {
    DisplayName: string
    Category?:string
    TypeLabel?:string
    Unprotected?: boolean
    Summary:string
}

// Finalized endpoint data
interface EndpointData {
    ID: string
    Category:string
    DisplayName: string
    TypeLabel?:string
    Unprotected?: boolean
    Permissions: string[]
    Summary:string
}


// An endpoints collection
type Endpoints = {
    [endpointID: string]: EndpointData;
}