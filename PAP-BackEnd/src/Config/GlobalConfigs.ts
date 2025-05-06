
interface GlobalConfigs {
    UseMockLogin:boolean,
    BenchmarkingMode?:boolean
}

const DevMode = !process.env.NODE_ENV

const Configs: GlobalConfigs = {
    UseMockLogin: true,
};

if (!DevMode){
    Configs.UseMockLogin = false
}
export default Configs