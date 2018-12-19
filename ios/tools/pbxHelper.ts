import * as xcode from "xcode";
import * as plist from "simple-plist";
import * as fs from "fs";

export type XProj = any;
interface NodeValue {
    comment?: string;
    value?: string;
}

export function getProject(file: string) {
    let content = fs.readFileSync(file);
    let _20w = content.toString("utf8", 0, 20);
    let config: XProj;
    if (_20w.startsWith("// !$*UTF8*$!")) { //由当前版本编辑器，打开过的项目转换后的文件
        let proj = xcode.project(file);
        config = proj.parseSync();
    } else { //xcode 7.3.1 之前的项目文件，`易接`生成此类型的文件
        config = checkPlistPBXProj(content, file)
    }
    return config;
}

function checkPlistPBXProj(content: Buffer, file: string) {
    let plistData = plist.parse(content, file);
    return getPlistPBXProj(plistData, file);
}
export function getPlistPBXProj(plistData, file: string) {
    let proj = new xcode.project("");
    (proj as any).productName = "$(TARGET_NAME)";
    proj.filepath = file;
    Object.setPrototypeOf(proj, xcode.project.prototype);
    let objects = plistData.objects;
    let projectName = objects[objects[plistData.rootObject].targets[0]].name;
    proj.hash = {
        headComment: "!$*UTF8*$!",
        project: plistData
    }
    let grouped = {} as { [key: string]: any };
    plistData.objects = grouped;
    formatEmptyString(objects);

    //遍历
    for (let key in objects) {
        let obj = objects[key];
        let isa = obj.isa;
        if (isa) {
            let group = grouped[isa];
            if (!group) {
                grouped[isa] = group = {};
            }
            group[key] = obj;
        }
    }

    //构建 comment
    let { PBXProject, XCConfigurationList, PBXNativeTarget, PBXFileReference, PBXBuildFile, XCBuildConfiguration } = grouped;
    let BuildPhase = {} as { [hash: string]: any };
    for (let key in grouped) {
        if (/PBX(.*?)BuildPhase/.test(key)) {
            BuildPhase[key] = {
                comment: RegExp.$1,
                resourceFiles: {}
            };
        }
    }
    setComment(PBXFileReference);
    //处理所有有 fileRef的配置
    Object.keys(PBXBuildFile).forEach(key => {
        let obj = PBXBuildFile[key];
        let fileRef = obj.fileRef;
        let file = PBXFileReference[fileRef];
        if (file) {
            let name = file.name || file.path;
            obj.fileRef_comment = name;
            //检查文件是否在资源文件中
            let comment = findResComment(key, name);
            PBXBuildFile[getComment(key)] = comment;
        } else {
            file = objects[fileRef];
            if (file) {
                let name = file.name || file.path;
                obj.fileRef_comment = name;
                PBXBuildFile[getComment(key)] = `${name} in Resources`;
            }
        }
    })

    //替换resource文件
    for (let bkey in BuildPhase) {
        let { resourceFiles, comment } = BuildPhase[bkey];
        for (let key in resourceFiles) {
            let phase = grouped[bkey];
            let obj = phase[key]
            phase[getComment(key)] = comment;
            obj.files = resourceFiles[key];
        }
    }

    for (let key in grouped) {
        if (key.endsWith("Group")) {
            let gDatas = grouped[key];
            setComment(gDatas, "children");
        }
    }
    setComment(XCBuildConfiguration);
    setComment(XCConfigurationList, "buildConfigurations");
    setComment(PBXProject, "targets");
    setComment(PBXNativeTarget, "buildPhases", "buildRules", "dependencies");
    let idx = 0;
    ["PBXNativeTarget", "PBXProject"].forEach(proKey => {
        let project = grouped[proKey];
        for (let key in project) {
            let proj = project[key];
            let hash = proj.buildConfigurationList;
            let cfgList = XCConfigurationList[hash];
            if (cfgList) {
                let comment = `Build configuration list for ${proKey} "${projectName}${idx++ || ""}"`;
                XCConfigurationList[getComment(hash)] = comment;
                proj.buildConfigurationList_comment = comment;
            }
        }
    });
    Object.keys(PBXProject).forEach(key => {
        PBXProject[getComment(key)] = "Project object";
    })
    return proj;
    function setComment(datas: { [key: string]: any }, ...childListKeys: string[]) {
        Object.keys(datas).forEach(key => {
            let data = datas[key];
            let comment = data.name || data.path;
            if (comment) {
                datas[getComment(key)] = comment;
            }
            childListKeys.forEach(ck => {
                let children = data[ck];
                if (children && Array.isArray(children)) {
                    for (let i = 0; i < children.length; i++) {
                        const child = children[i];
                        let dat = objects[child];
                        let comment = dat.name || dat.path;
                        if (!comment) {
                            let isa = dat.isa;
                            if (/PBX(.*?)BuildPhase/.test(isa)) {
                                comment = RegExp.$1;
                            }
                        }
                        let chData = { value: child } as NodeValue;
                        if (comment) {
                            chData.comment = comment;
                        }
                        children[i] = chData;
                    }
                }
            })
        });
    }

    function getComment(key: string) {
        return `${key}_comment`
    }
    function findResComment(key: string, name: string) {
        for (let bkey in BuildPhase) {
            let { resourceFiles, comment: commentName } = BuildPhase[bkey];
            let resource = grouped[bkey];
            for (let k in resource) {
                if (resource[k].files.indexOf(key) > -1) {
                    let comment = `${name} in ${commentName}`;
                    let files = resourceFiles[k];
                    if (!files) {
                        resourceFiles[k] = files = [];
                    }
                    files.push({
                        value: key,
                        comment
                    })
                    return comment;
                }
            }
        }
    }
    function formatEmptyString(objects: { [hash: string]: any }) {
        for (let key in objects) {
            let obj = objects[key];
            let too = typeof obj;
            if (too === "string") {
                if (obj === "") {
                    objects[key] = `""`;
                }
            } else if (too === "object") {
                if (obj) {
                    formatEmptyString(obj);
                }
            }
        }
    }
}