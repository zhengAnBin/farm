const target = "https%3A%2F%2Fgameapp.qq.com%2F353";
const indexURL = "https://xui.ptlogin2.qq.com/cgi-bin/xlogin?daid=5&&hide_title_bar=1&low_login=0&qlogin_auto_login=1&no_verifyimg=1&link_target=blank&appid=549000912&style=22&target=self&s_url=" + target;
const Referer = indexURL;
let index: string | null = "1";
const order = ["expires", "max-age", "domain", "path", "secure", "httponly", "samesite"]

function parse_cookie_array(origin: string) {
    return origin
        .split(" ")
        .map(item => {
            const a = item.split("=");
            if (order.includes(a[0].toLowerCase())) {
                return []
            }
            return a
        }).filter(item => item.length >= 2)
}

function parse_cookie_str(origin: string) {
    return parse_cookie_array(origin).map(item => `${item[0]}=${item[1]}`).join(" ")
}

// 登录本机指定QQ号
export const login = async (uin: string, ptLocalTk: string, cookie: string) => {
    const clientKeyResult = await fetch(`https://localhost.ptlogin2.qq.com:430${index}/pt_get_st?clientuin=${uin}&callback=ptui_getst_CB&r=${Math.random()}&pt_local_tk=${ptLocalTk}`, {
        headers: {
            cookie,
            Referer,
        }
    })
    console.log(await clientKeyResult.text());
    if (!clientKeyResult.ok) {
        return ;
    }

    const clientKeyCookie = parse_cookie_str(clientKeyResult.headers.get("Set-Cookie") || "") + " pt_local_token=" + ptLocalTk;
    console.log(clientKeyCookie)
    const jumpResult = await fetch(`https://ssl.ptlogin2.qq.com/jump?clientuin=${uin}&keyindex=19&pt_aid=1600000084&u1=https%3A%2F%2Fappimg2.qq.com%2Fhappyfarm%2Funity%2Fweb%2Findex%2Floginjump.html%3Ftype%3Djump&pt_local_tk=${ptLocalTk}&pt_3rd_aid=0&ptopt=1&style=40`, {
        headers: {
            cookie: clientKeyCookie,
            Referer,
        }
    })
    if (!jumpResult.ok) {
        return ;
    }
    const jumpCookie = parse_cookie_str(jumpResult.headers.get("Set-Cookie") || "");
    const cgi_farm_index = await fetch("https://nc.qzone.qq.com/cgi-bin/cgi_farm_index?mod=user&act=run", {
        headers: {
            cookie: jumpCookie,
        },
        method: "POST",
    });
    if (!cgi_farm_index.ok) {
        return ;
    }
    return {
        cookie: parse_cookie_str(cgi_farm_index.headers.get("Set-Cookie") || ""),
        cgi_farm_index: await cgi_farm_index.json(),
    }
}

type Item = {
    uin: number,
    face_index: number,
    gender: number,
    nickname: string,
    client_type: number,
    uin_flag: number,
    account: number
}

// 获取本机所有QQ账号
export const getLocalhostQQs = async (): Promise<{ ptLocalTk: string, list: Item[], cookie: string } | undefined> => {
    const indexResult = await fetch(indexURL);
    const cookie = indexResult.headers.get("Set-Cookie");

    if (typeof cookie === "string") {
        const item = parse_cookie_array(cookie).find(item => item[0] === "pt_local_token");
        if (!item) { return }
        const ptLocalTk = item[1];
        const cookieStr = parse_cookie_str(cookie);
        const requests = [1, 2, 3, 4, 5, 6, 7, 8].map(index => fetch(`https://localhost.ptlogin2.qq.com:430${index}/pt_get_uins?callback=ptui_getuins_CB&r=${Math.random()}&pt_local_tk=${ptLocalTk}`, {
            headers: {
                cookie: cookieStr,
                Referer,
            },
            credentials: 'include',
        }))
        const result = await Promise.any(requests);
        if (result.statusText === "OK") {
            const requestURL = new URL(result.url);
            index = requestURL.port.toString().replace("430", "");
            const rules = /\[.*\]/;
            const data = await result.text();
            if (data) {
                const r = data.match(rules);
                if (r) {
                    return {
                        ptLocalTk,
                        list: JSON.parse(r[0]),
                        cookie: cookieStr
                    }
                }
            }
        }
    }
}

// 登录本机所有QQ账号
export const loginLocalhostQQs = async () => {
    const data = await getLocalhostQQs();
    if (data) {
        const results = [];
        for await (const item of data.list) {
            const qqData = await getLocalhostQQs();
            if (qqData) {
                console.log(qqData.cookie)
                const result = await login(item.uin.toString(), qqData.ptLocalTk, qqData.cookie);
                results.push(result);
            }
        }
        return results;
    }
}

