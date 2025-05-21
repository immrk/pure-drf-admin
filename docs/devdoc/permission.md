# 权限系统指南

## 1.简介

pure-drf-admin对权限系统进行了特殊处理，实现了前端组件展示与后端接口层面(颗粒度: 请求方法维度)的双层权限控制，完全权限隔离！同一接口各请求方法独立鉴权！

主要特点：

- 前后端使用同一套权限代码，与菜单共用前端页面与数据表，全栈开发更方便
- 前端界面支持一键为指定接口创建CURD四种权限，若后端全局启用鉴权中间件，后端会自动对每种请求方法的权限进行校验
- 用户登录时会获取的权限代码可用于前端组件控制，若后端开启Redis服务，同时会将用户权限数据存入Redis
- 后端支持 中间件自动鉴权(推荐) 与 装饰器手动指定权限代码 进行鉴权两种方式

## 2.权限代码

本项目所提及的“权限代码”均为权限标识字符串，可通过前端的菜单管理创建“权限”类型菜单时手动指定，也可在具体菜单标签下一键为“指定接口地址”创建CURD四种方法权限(推荐)；前后端鉴权逻辑均使用该标识符进行权限判断

### 2.1 权限代码结构

权限代码样例：`/api/system/menu/:read`

权限代码解释：上述权限代码为后端鉴权中间件可自动识别的权限样式，其中`/api/system/menu/`表示需要请求的接口地址，`:read`表示该权限所生效的请求方法；当用户所对应的角色未被分配该权限时，使用get方法请求该方法将会被拦截，返回`403`错误代码；同理，若需要对post方法进行控制，可使用`/api/system/menu/:add`代码

**权限代码-请求方法 映射关系表**：
| 请求方法 | 中间件可自动识别的权限代码 |
|-----|-----|
| get | 接口地址:read |
| post | 接口地址:add |
| patch | 接口地址:change |
| delete | 接口地址:delete |

### 2.2 动态地址的权限代码

针对动态的接口地址，例如`/user/682d7952-1268-8013-a95b-76e8f41ef3a8/`的get请求，其中地址最后一部分为uuid或者id的，后端鉴权中间件会自动进行剔除处理，按照`/user/:read`的权限代码进行鉴权

代码实现方法详见[pure-drf后端鉴权中间件-动态接口地址处理](https://github.com/immrk/pure-drf-admin-backend/blob/main/utils/permissions.py#L50)

## 3.前端鉴权

该部分实现逻辑完全继承自pure admin，详细文档请参考[Pure Admin 保姆级文档-按钮、组件、类方法权限](https://pure-admin.cn/pages/RBAC/#%E6%8C%89%E9%92%AE%E3%80%81%E7%BB%84%E4%BB%B6%E3%80%81%E7%B1%BB%E6%96%B9%E6%B3%95%E6%9D%83%E9%99%90)

当前用户请求动态路由端口时(登陆或刷新时触发)，后端会同时返回菜单信息与权限代码数据。前端会将权限数据存储在local storage的user-info的permissions字段内。前端可使用pure admin提供的三种方法指定权限代码，实现前端组件的展示与否

1. Auth组件

   当用户拥有权限 /api/test/permission/:read 可见Auth组件包裹内容

   ```
   <Auth value="/api/test/permission/:read"></Auth>
   ```

2. v-if+hasAuth方法实现

   ```
   <div v-if="hasAuth('/api/test/permission/:read')"></div>
   ```

   hasAuth方法将完成是否具有权限代码的判断

3. v-auth指令方法
   ```
   <div v-auth="'/api/test/permission/:read'")"></div>
   ```

## 4.后端鉴权

pure drf提供了两套成熟的后端鉴权方式：中间件鉴权 与 装饰器鉴权。我们更推荐大家全局使用中间件并同时使用上述标准化权限代码，以保证前后端权限代码的完全同步，对全栈开发者更加友好

### 4.1 中间件自动鉴权

1. 中间件实现代码：[pure-drf后端鉴权中间件](https://github.com/immrk/pure-drf-admin-backend/blob/main/utils/permissions.py)
2. 全局配置(默认已应用)：[pure-dr全局使用自定义鉴权中间件](https://github.com/immrk/pure-drf-admin-backend/blob/main/puredrf/settings.py#L171)
3. 实现原理：当全局应用该中间件或者在接口类中指定使用该中间件后，当用户发送请求后，[pure-drf后端鉴权中间件](https://github.com/immrk/pure-drf-admin-backend/blob/main/utils/permissions.py)会对用户进行鉴权处理逻辑：
   1. 判断用户是否为激活状态(若激活继续，否则拒绝)
   2. 解析用户请求接口地址`path`与请求方法`method`并映射为`method_code`
   3. 从数据库/redis(用户若启用redis功能)获取并判断请求用户是否拥有`path:method_code`权限代码(若有则继续，否则拒绝)

### 4.2 装饰器指定鉴权

django支持使用装饰器，以在接口执行前先执行装饰器方法，故pure drf封装了一个装饰器`require_permission`, 用于对指定权限代码进行校验

1. 装饰器封装代码：[pure-drf鉴权装饰器代码](https://github.com/immrk/pure-drf-admin-backend/blob/main/utils/decorators.py#L11C5-L11C23)
2. 使用样例：[pure-drf装饰器鉴权示例](https://github.com/immrk/pure-drf-admin-backend/blob/main/apps/functiontest/views.py#L18)、[pure-drf鉴权前端权限测试页面](https://puredrf.kworlds.cn/#/test/permission)
   ```
   @require_permission("/api/test/permission/:read")
   def get(self, request, *args, **kwargs):
       return CustomResponse(success=True, data=None, msg="权限测试成功")
   ```
3. 鉴权逻辑：与中间件鉴权逻辑相同

## 5.如何创建与配置权限

pure drf的权限管理以及数据存储均与菜单模块相同，仅通过菜单类型来进行区分。因此，创建与配置权限也与菜单逻辑相同。

1. 新建权限：
   1. 为接口批量创建CURD四个权限代码(推荐)：前端页面 系统管理->菜单管理，点击已有菜单右侧的“+权限”按钮，输入需要控制的接口path即可一键完成四个权限的创建(:read、:add、:change、:delete)(**⚠️注意：未创建权限的接口，中间件不会进行鉴权会自动放行**)
   2. 手动创建权限代码：前端页面 系统管理->菜单管理，新建菜单，将菜单类型选择为”权限“即可
