
// Hard coded info
interface EndpointAttributes {
    DisplayName: string
    Category?:string
    Unprotected?: boolean
    Root?: boolean
    Connected?: string
    Summary:string
}

// Finalized endpoint data
interface EndpointData {
    ID: string
    DisplayName: string
    Category?:string

    Root?: boolean
    Unprotected?: boolean
    Connected?: string

    Permissions: string[]
    Summary:string
}


// An endpoints collection
type Endpoints = {
    [endpointID: string]: EndpointData;
}