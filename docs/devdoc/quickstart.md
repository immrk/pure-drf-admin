# 快速开始

按照如下步骤，配置环境、获取代码并进行初始化设置，即可快速启动前后端项目↓

## 1.环境准备

npm 20.x.x +, pnpm, python 3.12.x

1. **安装npm**

npm请安装v20.x.x及以上版本

2. **安装pnpm**

前端项目均使用pnpm进行包管理与项目构建

如果您还没安装 `pnpm`，请执行下面命令进行安装（`mac` 用户遇到安装报错请在命令前加上 `sudo`）

```
npm install -g pnpm
```

3. **安装pyhon**

为保证后端正常运行，建议使用3.12.x版本，其余版本可运行性需自行验证

## 2.代码获取与依赖库安装

前后端代码均开源于github平台，克隆项目代码，快速开始

- 获取前端代码，并安装所需依赖库

```
git clone https://github.com/immrk/pure-drf-admin.git
```

```
pnpm install
```

- 获取后端代码，并安装所需依赖库(建议创建python虚拟环境，避免第三方库干扰)

```git
git clone https://github.com/immrk/pure-drf-admin-backend.git
```

```
pip install -r requirements.py
```

## 3.前端初始化设置

开发环境下，若使用默认端口，则不需要进行任何修改，即可运行；若需要进行生产部署或修改开发环境接口地址请参照：

- 项目开发环境默认使用后端接口为http://127.0.0.1:8000，该接口与后端代码运行端口对应；若需要修改，请保证后端运行接口同步修改！开发环境配置文件地址：.env.development
- 生产环境(项目打包时所使用环境)：打包部署文件前，请将生产环境接口替换为自己已部署后端接口地址。生产环境配置文件地址：.env.production

## 4.后端初始化设置

**1. 创建.env文件，复制.env.example内容复制**

**注意：.env文件为后端运行所必须文件，请先完成配置，否则无法启动**

`.env`文件为后端运行的配置文件，基本设置例如 后端密钥设置、数据库配置、redis配置、日志设置等均在此进行；该文件被`.gitignore`忽略，不受git管理；为保证密钥数据安全性，建议保存默认设置，不要将密钥隐私数据上传到非私有代码托管平台！

请根据实际情况完成`.env`的配置:

```shell
# This file is used to store the environment variables for the project
# drf基础配置
SECRET_KEY="djangopassword"
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1

# 数据库配置
DB_ENGINE="mysql"
# DB_ENGINE="sqlite3"
DB_NAME="puredrf"
DB_USER="puredrf"
DB_PASSWORD="puredrf"
DB_HOST="127.0.0.1"
DB_PORT="3306"

# redis配置
# USE_REDIS=True
USE_REDIS=False
# 本地redis地址
REDIS_HOST="redis://127.0.0.1:6379/1"
# REDIS_PASSWORD="puredrf"

# 日志配置
API_LOG_ENABLE=True
API_LOG_METHODS="POST,PUT,DELETE"
```

**2. 生成SECRET_KEY并设置**

**3. 数据库初始化**

- Mysql数据库(推荐)

1. 在.env文件中设置`DB_ENGINE`为`mysql`, 切换至mysql数据库引擎, 并设置好数据库参数
2. 使用已有的迁移文件进行迁移, 创建表结构

```shell
python manage.py migrate
```

3. 将初始数据导入mysql数据库 注意：若启用redis缓存，则需要启动redis服务或者将`.env`里`USE_REDIS`设为`False`，否则将报错

   ```shell
   python manage.py loaddata ./data.json
   ```

- SQLite数据库(本地开发可使用，不建议部署)

1. 在.env文件中设置`DB_ENGINE`为`sqlite3`, 切换至sqlite数据库引擎
2. 使用已有的迁移文件进行迁移即可`python manage.py migrate`
3. 注意：由于sqllite在删除数据后并不会释放空间，会导致数据文件不断增大，故需要不定时使用`VACUUM指令，释放占用空间，避免文件过大

## 5.启动项目开始体验！

启动前端：

```
pnpm dev
```

启动后端：

```
python manage.py runserver
```

**恭喜你完成了Pure DRF的构建与运行，现在你可以体验并基于该框架进行开发啦！**
