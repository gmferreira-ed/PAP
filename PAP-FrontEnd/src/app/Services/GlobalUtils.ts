const GlobalUtils = {
    ObjectInfo(obj: Record<string, Record<string, any>>) :any[] {
        return Object.entries(obj).map(([key, values]) => {
            return {
                Key: key,
                ...values
            };
        });
    },

    FormatName(name: string) {
        return name.replace(/([A-Z])/g, ' $1').trim();
    }
};

export default GlobalUtils;