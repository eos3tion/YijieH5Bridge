/**
 * mac下编译ipa以及打包用脚本
 */
import * as fs from "fs";
import * as cp from "child_process";
import * as path from "path";
import { DOMParser as dom, XMLSerializer } from "xmldom";
import * as xpath from "xpath";
const AppName = "项目名称自行替换";
function run(baseDir: string) {
    let files = fs.readdirSync(baseDir);
    let failed = [] as string[];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let reg = new RegExp(`${AppName}\\{([^}]+)\\}\\.xcodeproj`)
        if (reg.test(file)) {
            let name = RegExp.$1;
            let xarchive = `./archive/${AppName}_${name}.xcarchive`;
            //检查文件是否有`libstdc++`，如果有，就干掉
            let pbxproj = path.join(file, "project.pbxproj");
            if (fs.existsSync(pbxproj)) {
                let content = fs.readFileSync(pbxproj, "utf8");
                if (!content.startsWith("//")) {//旧版xml的
                    let xml = new dom().parseFromString(content);
                    let nodes = xpath.select("/plist/dict/dict/dict", xml) as Node[];
                    let libstdcs = nodes.filter(node => (node as any).textContent.indexOf("libstdc") > -1);
                    if (libstdcs) {
                        let willDeleted = [] as any[];
                        libstdcs.forEach(node => {
                            willDeleted.push(node);
                            let prev = node.previousSibling;
                            while (prev) {
                                if ((prev as any).localName == "key") {
                                    willDeleted.push(prev);
                                    break;
                                }
                                prev = prev.previousSibling;
                            }
                        })
                        willDeleted.forEach(node => {
                            xml.removeChild(node);
                        });
                        let s = new XMLSerializer();
                        fs.writeFileSync(pbxproj, s.serializeToString(xml));

                    }
                }
            }
            let result = exec({ cmd: "xcodebuild", cwd: baseDir }, "-project", file, "-configuration", "Release", "-UseModernBuildSystem=NO", "-archivePath", xarchive, "clean", "archive", "-scheme", AppName);
            if (result.status == 0) {
                let result = exec({ cmd: "xcodebuild", cwd: baseDir }, "-project", file, "-configuration", "Release", "-UseModernBuildSystem=NO", "-archivePath", xarchive, "clean", "archive", "-exportPath", `./ipa/${AppName}_${name}`, "-exportOptionsPlist", "exportOptionsAdHoc.plist", "-exportArchive")
                if (result.status == 0) {
                    continue;
                }
            }
            failed.push(file);
        }
    }
    console.log(`编译失败的有:\n`, failed.join("\n"));
}

function exec(opt: string | { cmd?: string, cwd?: string, notThrowError?: boolean }, ...args: any) {
    if (typeof opt === "string") {
        cmd = opt;
    } else {
        var { cmd, cwd, notThrowError } = opt;
    }
    let option: cp.SpawnOptions = { stdio: "pipe" };
    if (cwd) {
        option.cwd = cwd;
    }
    let result = cp.spawnSync(cmd!!, args, option);
    let cmdstring = `${cmd} ${args.join(" ")}`;
    console.log("开始执行：", cmdstring);
    if (result.status && !notThrowError) {
        console.error(`status:${result.status},${result.stderr ? result.stderr.toString() : `执行失败：\t${cmdstring}`}`);
    }
    console.log("执行完成：", cmdstring);
    if (result.stdout) {
        console.log(result.stdout);
    }
    return result;
}

run("./");