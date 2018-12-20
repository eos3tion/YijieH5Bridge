/**
 * mac下编译ipa以及打包用脚本
 */
import * as fs from "fs";
import * as cp from "child_process";
import * as path from "path";
import * as plist from "simple-plist";
import { XProj, getPlistPBXProj } from "./pbxHelper";
import * as xcode from "xcode";

const AppName = "项目名称自行替换";
function run(baseDir: string) {
    let files = fs.readdirSync(baseDir);
    let failed = [] as string[];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let reg = new RegExp(`${AppName}\\{([^}]+)_ios\\}\\.xcodeproj`)
        if (reg.test(file)) {
            let channelID = RegExp.$1;
            let xarchive = `./archive/${AppName}_${channelID}.xcarchive`;
            //检查文件是否有`libstdc++`，如果有，就干掉
            let pbxproj = path.join(file, "project.pbxproj");
            if (fs.existsSync(pbxproj)) {
                let content = fs.readFileSync(pbxproj);
                let _20w = content.toString("utf8", 0, 20);
                let config: XProj;
                if (_20w.startsWith("// !$*UTF8*$!")) { //由当前版本编辑器，打开过的项目转换后的文件
                    let proj = xcode.project(pbxproj);
                    config = proj.parseSync();
                } else {
                    let plistData = plist.parse(content);
                    clearOldModule(plistData);
                    config = getPlistPBXProj(plistData, pbxproj);
                }

                //检查是否要替换闪屏
                checkLaunchScreen(channelID, config);

                //储存文件
                let cnt = config.writeSync();
                fs.writeFileSync(pbxproj, cnt);
            }
            let result = exec({ cmd: "xcodebuild", cwd: baseDir }, "-project", file, "-configuration", "Release", "-UseModernBuildSystem=NO", "-archivePath", xarchive, "clean", "archive", "-scheme", AppName);
            if (result.status == 0) {
                let result = exec({ cmd: "xcodebuild", cwd: baseDir }, "-project", file, "-configuration", "Release", "-UseModernBuildSystem=NO", "-archivePath", xarchive, "clean", "archive", "-exportPath", `./ipa/${AppName}_${channelID}`, "-exportOptionsPlist", "exportOptionsAdHoc.plist", "-exportArchive")
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

function clearOldModule(plistData) {
    Object.keys(plistData).forEach(key => {
        let val = plistData[key];
        let tov = typeof val;
        if (tov === "string") {
            if (val.indexOf("libstdc") > -1) {
                delete plistData[key];
            }
        } else if (tov === "object") {
            if (val) {
                clearOldModule(val);
            }
        }
    })
}


/**
 * 变更启动页
 */
function changeLaunch(proj: XProj, channelID: string, imgFile: string, basePath: string) {
    let fileName = "Launch.storyboard";
    const dstImgFileName = "LaunchImg.jpg";
    let Launch = path.join(path.dirname(__filename), "assets", fileName);
    //将文件拷贝到对应项目
    let groupKey = proj.findPBXGroupKey({ name: "Yijie" });
    if (groupKey) {
        let group = proj.getPBXGroupByKey(groupKey);
        let chnPath = `${channelID}_ios`;
        let rPath = path.join(chnPath, fileName);
        let rImgPath = path.join(chnPath, dstImgFileName);
        let groupPath = path.join(basePath, group.path);
        //添加项目文件
        let f = proj.hasFile(rPath);
        if(!f){
            f = proj.addResourceFile(rPath, { lastKnownFileType: "file.storyboard" },groupKey);
        }
        proj.addToPbxResourcesBuildPhase(f);
        f = proj.hasFile(rImgPath);
        if(!f){
            f = proj.addResourceFile(rImgPath, { lastKnownFileType: "image.png" }, groupKey);
        }
        proj.addToPbxResourcesBuildPhase(f);
       
        fs.copyFileSync(Launch, path.join(groupPath, rPath));
        fs.copyFileSync(imgFile, path.join(groupPath, rImgPath));
        //替换LaunchScreen
        let plistfile = path.join(groupPath, chnPath, "Info.plist");
        let infoData = plist.readFileSync(plistfile);
        infoData.UILaunchStoryboardName = "Launch";
        plist.writeFileSync(plistfile, infoData);
    }
}

let channels = JSON.parse(fs.readFileSync(path.join(__dirname, "assets", "1sdk.json"), "utf8"));

function checkLaunchScreen(channelID: string, proj: XProj) {
    //检查配置
    let img = channels[channelID];
    if (img) {
        changeLaunch(proj, channelID, path.join(__dirname, "assets", "launchimgs", img), path.join(__dirname, ".."))
    }
}


run("./");