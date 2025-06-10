type User = {
    username: string
    fullname:string
    email: string

    role:string
    permission_level:number

    userid:number,
    phone:number,
    
    address: string
    city: string
    country: string
    postalcode: string
    
    created:number,
    card_id:number|null,
    active: boolean
  }