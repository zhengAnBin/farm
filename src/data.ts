import path from "node:path";
import fs from "node:fs/promises";
import { snapshotDB } from "./db.ts";
import { xml2js } from "xml2js";

const xmlFileList = [
    "https://appimg.qq.com/happyfarm/data/addon_m_v_1163.xml",  // 杂项配置放这里
    "https://appimg.qq.com/happyfarm/data/crop_data_v_9.xml",  // 只有普通种子
    "https://appimg.qq.com/happyfarm/data/data_zh_CN_v_1687.xml",  // 每周4都需要重新获取，这里有高级种子和节气种子
    "https://appimg.qq.com/happyfarm/data/others_v_1107.xml"
]

const refreshData = async (name: string, url: string) => {
    const result = await fetch(url);
    if (result.ok) {
        try {
            const data = await result.text();
            await fs.writeFile(path.resolve("db", name), data, "utf8");
        } catch (error) {
            console.error(error);
        }
    }
}

const dataMap = new Map();

const loadXml = async (str: string) => {
    const files = await fs.readdir("db");
    const f = files.find((f: string) => f.includes(str));
    if (f) {
        const ordersBuf = await fs.readFile(path.resolve("db", f), "utf8");
        return ordersBuf.toString();
    }
}

/**
 * 加载游戏必要的数据
 */
export const requestData = async () => {
    for await (const url of xmlFileList) {
        const urlFragment = url.split("/");
        const fileName = urlFragment[urlFragment.length - 1];
        if (!snapshotDB.exists("/" + fileName)) {
            await refreshData(fileName, url);
        } else {
            const dataTime = new Date(snapshotDB.getData("/" + fileName));
            if (Date.now() - dataTime.getTime() > 2592000000) {
                await refreshData(fileName, url);
            }
        }
    }

    const others = await loadXml("others");
    if (others) {
        const othersXml = xml2js(others, { compact: true })
        // TODO:
    }

}
