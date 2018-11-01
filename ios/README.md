## 目录结构说明  
### project 母包项目目录  
需要替换  `info.plist` 相关内容
替换 `Define.h` 中的登录验证的地址

### tools  
使用`nodejs`编写的编译脚本  
使用方式，先制作好母包，登录好账号
先使用`易接`工具进行生成不同渠道的项目文件`xxx1_project.xcodeproj`  `xxx2_project.xcodeproj` `xxx3_project.xcodeproj`  
更改 `tools/buildAll.ts` 中对应的项目名称  
编译成`js`，使用`nodejs`执行

