import { project as pbxProj } from "xcode";
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
        let proj = new pbxProj(file);
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
    let proj = new pbxProj(".");
    proj.filepath = file;
    let rawObjects = plistData.objects;
    let projectName = rawObjects[rawObjects[plistData.rootObject].targets[0]].name;
    proj.hash = {
        headComment: "!$*UTF8*$!",
        project: plistData
    }
    let grouped = {} as { [key: string]: any };
    plistData.objects = grouped;
    // formatString(rawObjects);

    //遍历
    for (let hash in rawObjects) {
        let obj = rawObjects[hash];
        let isa = obj.isa;
        if (isa) {
            let group = grouped[isa];
            if (!group) {
                grouped[isa] = group = {};
            }
            group[hash] = format(obj);
        }
    }

    //构建 comment
    let { PBXProject, XCConfigurationList, PBXNativeTarget, PBXFileReference, PBXBuildFile, XCBuildConfiguration, PBXVariantGroup } = grouped;
    let varDict = {} as { [hash: string]: any };
    for (let hash in PBXVariantGroup) {
        let variant = rawObjects[hash];
        if (variant) {
            variant.children.forEach(key => {
                varDict[key] = variant;
            })
        }
    }
    let fileInGroupComment = {} as { [hash: string]: string };
    for (let isa in grouped) {
        if (/PBX(.*?)BuildPhase/.test(isa)) {
            let groups = grouped[isa];
            let commentName = RegExp.$1;
            Object.keys(groups).forEach(key => {
                let group = groups[key];
                let files = group.files;
                for (let i = 0; i < files.length; i++) {
                    const hash = files[i];
                    let name = getCommentWithHash(hash);
                    let comment = `${name} in ${commentName}`;
                    files[i] = {
                        value: hash,
                        comment
                    }
                    fileInGroupComment[hash] = comment;
                }
                groups[getCommentKey(key)] = commentName;
            })
        }
    }
    setComment(PBXFileReference);
    //处理所有有 fileRef的配置
    Object.keys(PBXBuildFile).forEach(key => {
        let obj = PBXBuildFile[key];
        let fileRef = obj.fileRef;
        let name = getCommentWithHash(fileRef);
        obj.fileRef_comment = name;
        let comment = fileInGroupComment[fileRef];
        if (comment) {
            PBXBuildFile[getCommentKey(key)] = comment;
        } else {
            PBXBuildFile[getCommentKey(key)] = `${name} in Resources`;
        }
    })

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
                XCConfigurationList[getCommentKey(hash)] = comment;
                proj.buildConfigurationList_comment = comment;
            }
        }
    });
    Object.keys(PBXProject).forEach(key => {
        PBXProject[getCommentKey(key)] = "Project object";
    })
    return proj;
    function setComment(datas: { [key: string]: any }, ...childListKeys: string[]) {
        if (!datas) {
            return;
        }
        Object.keys(datas).forEach(key => {
            let data = datas[key];
            let comment = getCommentWithHash(key);
            if (comment) {
                datas[getCommentKey(key)] = comment;
            }
            childListKeys.forEach(ck => {
                let children = data[ck];
                if (children && Array.isArray(children)) {
                    for (let i = 0; i < children.length; i++) {
                        const child = children[i];
                        let dat = rawObjects[child];
                        let comment = getComment(dat);
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
    function getComment(file) {
        return file.name || file.path;
    }
    function getCommentWithHash(hash: string) {
        //检查是否在VariantGroup中
        let variant = varDict[hash];
        if (variant) {
            return variant.name;
        }
        let file = rawObjects[hash];
        if (file) {
            let ref = file.fileRef;
            if (ref) {
                return getCommentWithHash(ref);
            }
            return getComment(file);
        }
    }

    function getCommentKey(key: string) {
        return `${key}_comment`
    }

    function format(objects: { [key: string]: any }, output: { [key: string]: any } = {}) {
        for (let key in objects) {
            let obj = objects[key];
            let too = typeof obj;
            let out = obj;
            if (obj == null) {
                obj = "";
                too = "string";
            }
            if (too === "string") {
                if (obj === "" || /\s|[<>\-+@$\\()|*=]/.test(obj)) {
                    out = `"${obj}"`;
                }
            }
            else if (too === "object") {
                if (obj) {
                    out = Array.isArray(obj) ? [] : {};
                    format(obj, out);
                }
            }
            output[key] = out;
        }
        return output;
    }
}