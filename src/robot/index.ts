import { Task } from "./task.ts";

export const robotMap = new Map<string, Robot>();
export const globalTask = new Task();

export class Robot extends Task {
    cookie = "";
    nick = "";
    skey = "";
    uin = "";
    uId = "";
    isVip = false;
    isLogin = false;

    setCookie(cookie: string) {
        this.cookie = cookie;
    }

    getMcCookie() {
        return this.cookie + "; midas_openkey=" + this.skey + "; midas_openid=" + this.uin;
    }

    // deno-lint-ignore no-explicit-any
    update(data: Record<string, any>) {
        this.cookie = data.cookie;
        this.nick = data.nick;
        this.skey = data.skey;
        this.uin = data.uin;
        this.uId = data.uId;
        this.isVip = !!data.vip;
        this.isLogin = !!data.isLogin;
    }

    createRequest() {

    }

    info() { }

    infoToInflux() { }
    infoToMongo() { }
    infoToMysql() { }
}
