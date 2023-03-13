import { loginLocalhostQQs } from "./login.ts"
import { Robot, robotMap } from "./robot/index.ts";

console.log("1，处理登录");
console.log("   获取本机所有已登录的QQ账号信息")
const localhostQQs = await loginLocalhostQQs();
if (localhostQQs) {
    localhostQQs.forEach(item => {
        console.log(item);
        const robot = new Robot();
        robotMap.set(robot.uin, robot);
    });
} else {
    console.log("   登录处理失败，程序结束运行")
}

