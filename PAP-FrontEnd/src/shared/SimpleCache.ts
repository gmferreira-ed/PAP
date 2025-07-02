
export default class SimpleCache {

    CachedData:any 
    LastRequest = 0
    CacheExpiration = 10
    FetchFunction

    OnGoingFunction: Promise<any>|undefined
    OnFetch: Function | undefined

    ResetExpiration() {
        this.LastRequest = 0
    }


    async Get(IgnoreCache: boolean = false): Promise<any> {
        return new Promise(async (resolve, reject) => {
            const RequestTimestamp = Date.now()
            const Difference = (RequestTimestamp - this.LastRequest) / 1000
            const IsExpired = this.CacheExpiration < (Difference)

            if (IsExpired || IgnoreCache) {
                this.LastRequest = RequestTimestamp

                this.OnGoingFunction = this.FetchFunction()

                const Result = await this.OnGoingFunction

                this.OnGoingFunction = undefined
                this.CachedData = Result

                if (IgnoreCache) {
                    console.log("Forced cache get", this.CachedData)
                }

                if (this.OnFetch) {
                    this.OnFetch(this.CachedData)
                }

                resolve(Result)
                return Result
            } else {

                const Result = this.OnGoingFunction ? await this.OnGoingFunction : this.CachedData
                if (this.OnFetch) {
                    this.OnFetch(Result)
                }
                
                resolve(Result)
                return Result
            }
        })
    }
    constructor(FetchFunction: Function, CacheExpiration: number = 10) {
        this.FetchFunction = FetchFunction
        this.CacheExpiration = CacheExpiration
    }
}