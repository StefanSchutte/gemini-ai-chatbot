export class RateLimit {
    private timestamps: number[] = [];
    private readonly limit: number;
    private readonly interval: number;

    constructor(limit: number, interval: number) {
        this.limit = limit;
        this.interval = interval;
    }

    async canMakeRequest(): Promise<boolean> {
        const now = Date.now();
        this.timestamps = this.timestamps.filter(time => now - time < this.interval);

        if (this.timestamps.length >= this.limit) {
            return false;
        }

        this.timestamps.push(now);
        return true;
    }
}

export const searchRateLimit = new RateLimit(50, 60 * 1000); // 50 requests