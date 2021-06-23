// node 服务器 处理浏览器 加载各种资源的请求 index.html js vue
const Koa = require('koa')
const fs = require('fs')
const path = require('path')
const compilerSFC = require('@vue/compiler-sfc')
const compilerDOM = require('@vue/compiler-dom')
// 创建实例
const app = new Koa()

// 中间件配置
// 处理路由
app.use(async ctx => {
  const {url, query} = ctx.request 
  // 先处理首页请求
  if(url === '/') {
    ctx.type = "text/html"
    ctx.body = fs.readFileSync(path.join(__dirname,"./public/index.html"),'utf-8')
  }else if(url.endsWith('.js')) {
    const p = path.join(__dirname, url);
    // js 文件加载处理
    ctx.type = "application/javascript"
    ctx.body = rewriteImport(fs.readFileSync(p,'utf-8'))
  } else if(url.startsWith('/@modules/')) {
    // 裸模块名称
    const moduleName = url.replace('/@modules/', "")
    // // 去node_modules目录中找
    const prefix = path.join(__dirname,'./node_modules', moduleName)
    // // package.json 中获取module 字段
    const module = require(prefix + '/package.json').module
    const filePath = path.join(prefix, module)
    const ret = fs.readFileSync(filePath, "utf8")
    ctx.type = "application/javascript"
    ctx.body = rewriteImport(ret)
  }else if (url.indexOf('.vue') > -1) {
    // SFC 请求
    // 读取vue 文件 解析为js
    const p = path.join(__dirname,url.split('?')[0])
    const ret = compilerSFC.parse(fs.readFileSync(p,'utf8'))
    if(!query.type) {
        // 获取脚本部分内容
      const scriptContent = ret.descriptor.script.content
      // 替换默认导出为一个常量
      const script = scriptContent.replace(
        'export default ', 
        'const __script ='
        )
      ctx.type = "application/javascript"
      ctx.body = `
        ${rewriteImport(script)}
        // 解析template 内容
        import {render as __render} from '${url}?type=template'
        __script.render = __render
        export default __script
      `
    }else if(query.type === 'template') {
      const tpl = ret.descriptor.template.content
      // b编译为render
      const render = compilerDOM.compile(tpl, {mode: 'module'}).code
      ctx.type = 'application/javascript'
      ctx.body = rewriteImport(render)
    }
  }
})

// 裸模块 地址重写
function rewriteImport(cont) {
  return cont.replace(/ from ['"](.*)['"]/g, function (s1,s2) {
    if (s2.startsWith("./") || s2.startsWith("/") || s2.startsWith("../")) {
      return s1;
    } else {
      return ` from '/@modules/${s2}'`
    }
  })
}


app.listen(3000, () => {
  console.log('服务器已启动 \n\n http://localhost:3000/ \n ' )
})