
export default class SimpleCache {

    CachedData:any 
    LastRequest = 0
    CacheExpiration = 10
    FetchFunction

    OngoingFunction: Promise<any>|undefined
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

                this.OngoingFunction = this.FetchFunction()

                const Result = await this.OngoingFunction

                this.OngoingFunction = undefined
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

                const Result = this.OngoingFunction ? await this.OngoingFunction : this.CachedData
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