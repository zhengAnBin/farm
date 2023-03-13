import dayjs from "dayjs";

export class Delay {
    delay: Record<string, { self: Task, fn: Function }[]> = {};
    delayTimer: any = null
    delayExecutionInterval = 500

    constructor() {
        this.startDelay();
    }

    cmd(current: string) {
        if (Array.isArray(this.delay[current])) {
            this.delay[current].forEach(item => {
                item.self.add(item.fn);
            });
            delete this.delay[current];
        }
    }

    startDelay() {
        if (!this.delayTimer) {
            this.delayTimer = setInterval(() => {
                Object.keys(this.delay).forEach(time => {
                    if (dayjs(time, "YYYY-MM-DD HH:mm:ss").toDate() <= new Date()) {
                        this.cmd(time);
                    }
                });
            }, this.delayExecutionInterval);
        }
    }

    add(symbol: string | number | Date, fn: Function, self: Task) {
        let delayDate: Date;
        if (typeof(symbol) === "string") {
            delayDate = dayjs(symbol, "YYYY-MM-DD HH:mm:ss").toDate();
        } else if(typeof(symbol) === "number") {
            delayDate = new Date(symbol);
        } else {
            delayDate = symbol;
        }

        if (delayDate > new Date()) {
            const delayKey = dayjs(delayDate).format("YYYY-MM-DD HH:mm:ss");
            !this.delay[delayKey] && (this.delay[delayKey] = []);
            this.delay[delayKey].push({
                fn,
                self
            });
        } else {
            self.add(fn);
        }
    }
}

const delay = new Delay();

export class Task {
    queue: any[] = [];
    queueTimer: any = null;
    queueExecutionInterval = 300
    queueInImplementation = false

    async execute() {
        try {
            // 确保不会因为请求发现错误而导致任务退出
            await this.queue.shift().call();
        } catch (error) {
            console.log(error);
        }

        if (this.queue.length) {
            this.queueTimer = setTimeout(this.execute.bind(this), this.queueExecutionInterval);
        } else {
            this.queueInImplementation = false;
        }
    }

    startQueue() {
        if (!this.queueInImplementation) {
            this.queueInImplementation = true;
            this.execute();
        }
    }

    public add(symbol: string | number | Date | Function, fn?: Function) {
        if (typeof symbol === "function") {
            this.queue.push(symbol);
            this.startQueue();
        } else {
            delay.add(symbol, fn as Function, this);
        }
    }
}
