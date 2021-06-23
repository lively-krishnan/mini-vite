## 准备工作

‘ - 需要先安装

```js
 npm i koa && @vue-next @vue/compiler-sfc && @vue/runtime-dom
```

## 进入主题

1、 需要一个 node 服务器 处理浏览器加载各种资源请求 html/js/vue 等

```js
const Koa = require("koa");
```

2、fs 模块 读取文件

```js
const fs = require("fs");
```

3、path 获取路径等

```js
const path = require("path");
```

4、compilerSFC 编译解析 js 模板
5、compilerDOM 编译解析 template 模板

```js
直接从node包内引入;
const compilerSFC = require("@vue/compiler-sfc");
const compilerDOM = require("@vue/compiler-dom");
```

## 开始操作

```js
// 创建实例
const app = new Koa();
// 增加一个中间件配置 处理路由
app.use(async (ctx) => {
  // 获取地址栏 url 以及 query
  const { url, query } = ctx.request;
  // 处理首页请求 ，请求类型 改为 text/html
  // 读取index.html 绝对路径 并设置为 utf8 编码
  // 判断路径是否已 .js 结尾 拼接路径 类型改为 javascript 给到浏览器
  // 再检查开头是否有 /@modules/ 出现，替换值处理 得到 vue .
  //  再去node_modules 内寻找 vue 文件
  // 在获取vue 文件里的 package.json 下的 module (此时拿到的是node_modules内 vue 的打包地址)
  // 拼接地址，得到一个完整的地址后 ，同步读取 打包后的路径

  // 判断 url 内 是否有.vue 文件
  //  使用query.type 判断 template 是否存在，
  // 存在使用compilerDOM编译 template
  // 不存在 则使用 compilerSFC 重新编译 render

  // 以上方法 都需要用到裸模块转换方法 rewriteImport
  // 根据传入的地址，判断

  function rewriteImport(cont) {
    return cont.replace(/ from ['"](.*)['"]/g, function (s1, s2) {
      if (s2.startsWith("./") || s2.startsWith("/") || s2.startsWith("../")) {
        return s1;
      } else {
        return ` from '/@modules/${s2}'`;
      }
    });
  }
});
```
