# 项目更新日志

## 2025.05.23 [前端bug修复]修复部分 子菜单 组件匹配错误的bug

- 前端：临时在[pure-drf-admin](https://github.com/immrk/pure-drf-admin)前端前端项目内，修复组件匹配错误的bug（偶发性bug，初步分析原因为父路由组件与子路由组件冲突导致），但pure-admin框架暂未修复该bug，待框架更新后会同步对齐该部分代码

## 2025.05.21 [文档更新]新增“权限模块”开发文档

- 前端：新增“权限模块”开发文档

## 2025.05.04 [功能新增]后端新增数据库一键初始化功能

- 后端：增加数据初始化sql文件与python脚本，支持使用`python dbinit.py`命令一键完成数据库初始化与数据导入，使用方法详见：[快速开始-后端初始化](https://puredrf.kworlds.cn/docs/devdoc/quickstart.html#_4-%E5%90%8E%E7%AB%AF%E5%88%9D%E5%A7%8B%E5%8C%96%E8%AE%BE%E7%BD%AE)

## 2025.05.01 [版本更新]同步更新pure admin版本为6.0.0

- 前端：同步pure admin最新发行版本进行更新
- 后端：支持配置多个数据库
