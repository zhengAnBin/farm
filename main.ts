import { loginLocalhostQQs } from "./src/login.ts"
import { Robot, robotMap } from "./src/robot/index.ts";
import { requestData } from "./src/data.ts";

console.log("1，处理登录");
const localhostQQs = await loginLocalhostQQs();
if (localhostQQs) {
    localhostQQs.forEach(item => {
        console.log(item);
        const robot = new Robot();
        robotMap.set(robot.uin, robot);
    });

    console.log("2，处理数据字典")
    await requestData();

    console.log("3，开始运行程序")

} else {
    console.log("   登录处理失败，程序结束运行")
}

