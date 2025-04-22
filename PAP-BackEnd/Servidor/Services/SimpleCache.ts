module.exports = class Cache{
    
    Data =[]
    LastRequest = 0
    CacheExpiration = 10
    FetchFunction

    ResetExpiration(){
        this.LastRequest = 0
    }

    async Get(IgnoreCache:boolean=false){
        return new Promise(async (resolve, reject) => {
            const RequestTimestamp =  Date.now()
            const Difference = (RequestTimestamp-this.LastRequest)/1000
            const IsExpired = this.CacheExpiration < (Difference)

            if (IsExpired || IgnoreCache){
                this.LastRequest = RequestTimestamp

                let Result = await this.FetchFunction()
                this.Data = Result

                if (IgnoreCache){
                    console.log("Forced catch get",this.Data)
                }
                resolve(Result)
                return Result
            }else{
                resolve(this.Data)
                return this.Data
            }
        })
    }
    constructor(FetchFunction:Function, CacheExpiration:number=10) {
        this.FetchFunction = FetchFunction
        this.CacheExpiration = CacheExpiration
    }
}