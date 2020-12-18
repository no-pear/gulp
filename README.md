## 开发脚手架及封装自动化构建工作流

### 工程化概述

#### 主要解决的问题

+ 传统语言或语法的弊端
+ 无法使用模块化/组件化
+ 重复的机械工作
+ 代码风格统一、质量保证
+ 依赖后端服务接口支持
+ 整体依赖后端项目

#### 工程化表现

### 脚手架工具

#### 脚手架工具的本质作用

+ 创建项目基础架构
+ 提供项目规范和约定

#### 常用的脚手架工具

+ create-react-app

+ vue-cli

+ Angular-cli

+ Yeoman

  + 基本使用

  ```
  // 全局范围内安装yo
  npm i yo -g
  // 通过yo创建
  yo node
  ```

  

+ Plop

#### 脚手架的工作原理

### 自动化构建

#### 常用的自动化构建工具

+ Grunt
+ Gulp
+ FIS

#### Grunt

+ 基本使用

```js
1.npm i grunt -D
2.创建gruntfile.js Grunt的入口文件
3.创建任务
4.npx grunt foo // 执行foo任务 // hello grunt
```

```js
// Grunt 的入口文件
// 用于定义一些需要 Grunt 自动执行的任务
// 需要导出一个函数
// 此函数接收一个 grunt 的对象类型的形参
// grunt 对象中提供一些创建任务时会用到的 API

module.exports = grunt => {
  grunt.registerTask('foo', 'a sample task', () => {
    console.log('hello grunt')
  })

  grunt.registerTask('bar', () => {
    console.log('other task')
  })

  // // default 是默认任务名称
  // // 通过 grunt 执行时可以省略
  // grunt.registerTask('default', () => {
  //   console.log('default task')
  // })

  // 第二个参数可以指定此任务的映射任务，
  // 这样执行 default 就相当于执行对应的任务
  // 这里映射的任务会按顺序依次执行，不会同步执行
  grunt.registerTask('default', ['foo', 'bar'])

  // 也可以在任务函数中执行其他任务
  grunt.registerTask('run-other', () => {
    // foo 和 bar 会在当前任务执行完成过后自动依次执行
    grunt.task.run('foo', 'bar')
    console.log('current task runing~')
  })

  // 默认 grunt 采用同步模式编码
  // 如果需要异步可以使用 this.async() 方法创建回调函数
  // grunt.registerTask('async-task', () => {
  //   setTimeout(() => {
  //     console.log('async task working~')
  //   }, 1000)
  // })

  // 由于函数体中需要使用 this，所以这里不能使用箭头函数
  grunt.registerTask('async-task', function () {
    const done = this.async()
    setTimeout(() => {
      console.log('async task working~')
      done()
    }, 1000)
  })
}
```



+ 标记任务失败

```js
module.exports = grunt => {
  // 任务函数执行过程中如果返回 false
  // 则意味着此任务执行失败
  grunt.registerTask('bad', () => {
    console.log('bad working~')
    return false
  })

  grunt.registerTask('foo', () => {
    console.log('foo working~')
  })

  grunt.registerTask('bar', () => {
    console.log('bar working~')
  })

  // 如果一个任务列表中的某个任务执行失败
  // 则后续任务默认不会运行
  // 除非 grunt 运行时指定 --force 参数强制执行
  grunt.registerTask('default', ['foo', 'bad', 'bar'])

  // 异步函数中标记当前任务执行失败的方式是为回调函数指定一个 false 的实参
  grunt.registerTask('bad-async', function () {
    const done = this.async()
    setTimeout(() => {
      console.log('async task working~')
      done(false)
    }, 1000)
  })
}
```

+ 配置方法

```js
module.exports = grunt => {
  // grunt.initConfig() 用于为任务添加一些配置选项
  grunt.initConfig({
    // 键一般对应任务的名称
    // 值可以是任意类型的数据
    foo: {
      bar: 'baz'
    }
  })

  grunt.registerTask('foo', () => {
    // 任务中可以使用 grunt.config() 获取配置
    console.log(grunt.config('foo'))
    // 如果属性值是对象的话，config 中可以使用点的方式定位对象中属性的值
    console.log(grunt.config('foo.bar'))
  })
}
```

+ 多目标任务

```js
module.exports = grunt => {
  // 多目标模式，可以让任务根据配置形成多个子任务

  // grunt.initConfig({
  //   build: {
  //     foo: 100,
  //     bar: '456'
  //   }
  // })

  // grunt.registerMultiTask('build', function () {
  //   console.log(`task: build, target: ${this.target}, data: ${this.data}`)
  // })  

  grunt.initConfig({
    build: {
      options: {
        msg: 'task options'
      },
      foo: {
        options: {
          msg: 'foo target options'
        }
      },
      bar: '456'
    }
  })

  grunt.registerMultiTask('build', function () {
    console.log(this.options())
  })
}

```

+ 插件的使用

  + 安装插件

  + 在gruntfile.js文件中加载插件

    ```
    grunt.loadNpmTasks('grunt-contrib-clean')
    ```

    

  + 添加配置选项(查看插件官方文档)

+ grunt 常用插件

  + grunt-sass
  + grunt-babel
  + grunt-contrib-watch

  ```js
  const sass = require('sass')
  const loadGruntTasks = require('load-grunt-tasks')
  
  module.exports = grunt => {
    grunt.initConfig({
      sass: {
        options: {
          sourceMap: true,
          implementation: sass
        },
        main: {
          files: {
            'dist/css/main.css': 'src/scss/main.scss'
          }
        }
      },
      babel: {
        options: {
          sourceMap: true,
          presets: ['@babel/preset-env']
        },
        main: {
          files: {
            'dist/js/app.js': 'src/js/app.js'
          }
        }
      },
      watch: {
        js: {
          files: ['src/js/*.js'],
          tasks: ['babel']
        },
        css: {
          files: ['src/scss/*.scss'],
          tasks: ['sass'] // 文件改变执行的任务
        }
      }
    })
  
    // grunt.loadNpmTasks('grunt-sass')
    loadGruntTasks(grunt) // 自动加载所有的 grunt 插件中的任务
  
    grunt.registerTask('default', ['sass', 'babel', 'watch'])
  }
  ```

  

#### Gulp

+ 基本使用(gulp当中的任务都是**异步任务**)

```js
// // 导出的函数都会作为 gulp 任务
// exports.foo = () => {
//   console.log('foo task working~')
// }

// gulp 的任务函数都是异步的
// 可以通过调用回调函数标识任务完成
exports.foo = done => {
  console.log('foo task working~')
  done() // 标识任务执行完成
}

// default 是默认任务
// 在运行是可以省略任务名参数
exports.default = done => {
  console.log('default task working~')
  done()
}

// v4.0 之前需要通过 gulp.task() 方法注册任务
const gulp = require('gulp')

gulp.task('bar', done => {
  console.log('bar task working~')
  done()
})

```

+ 创建组合任务

```js
const { series, parallel } = require('gulp')

const task1 = done => {
  setTimeout(() => {
    console.log('task1 working~')
    done()
  }, 1000)
}

const task2 = done => {
  setTimeout(() => {
    console.log('task2 working~')
    done()
  }, 1000)  
}

const task3 = done => {
  setTimeout(() => {
    console.log('task3 working~')
    done()
  }, 1000)  
}

// 让多个任务按照顺序依次执行
exports.foo = series(task1, task2, task3)

// 让多个任务同时执行
exports.bar = parallel(task1, task2, task3)

```

+ 异步任务的三种方式
+ Gulp文件操作API

```js
const { src, dest } = require('gulp')
const cleanCSS = require('gulp-clean-css')
const rename = require('gulp-rename')

exports.default = () => {
  return src('src/*.css')
    .pipe(cleanCSS())
    .pipe(rename({ extname: '.min.css' }))
    .pipe(dest('dist'))
}

```



#### Gulp 自动化构建案例

+ 样式编译

```js
// 样式编译
const style = () => {
  return src('src/assets/styles/*.scss', { base: 'src' })  // base 基准目录
    .pipe(plugins.sass({ outputStyle: 'expanded' })) // outputStyle: 'expanded' 完全展开
    .pipe(dest('temp'))
    .pipe(bs.reload({ stream: true }))
}
```



+ 脚本编译

```js
// 脚本编译
const script = () => {
  return src('src/assets/scripts/*.js', { base: 'src' })
    .pipe(plugins.babel({ presets: ['@babel/preset-env'] }))
    .pipe(dest('temp'))
    .pipe(bs.reload({ stream: true }))
}
```



+ 页面模板编译

```js
// 页面模板编译
const page = () => {
  return src('src/*.html', { base: 'src' })
    .pipe(plugins.swig({ data, defaults: { cache: false } })) // 防止模板缓存导致页面不能及时更新
    .pipe(dest('temp'))
    .pipe(bs.reload({ stream: true }))
}
```

+ 图片转换

```js
// 图片转换
const image = () => {
  return src('src/assets/images/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}
```



+ 字体文件转换

```js
// 字体文件转换
const font = () => {
  return src('src/assets/fonts/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}
```

+ 其他文件（public文件拷贝）

```js
// public目录文件拷贝
const extra = () => {
  return src('public/**', { base: 'public' })
    .pipe(dest('dist'))
}
```

+ 文件清除

```js
// 文件清除
const clean = () => {
  return del(['dist', 'temp']) // del是外部包
}
```



+ 自动加载插件 gulp-load-plugins

`所有插件都会成为这个对象的属性`  ~~gulp-sass~~    plugins.sass

```js
const loadPlugins = require('gulp-load-plugins')
const plugins = loadPlugins()
```

+ 热更新开发服务器

```js
// 热更新开发服务器
const serve = () => {
  // 监视文件变化自动重新构建
  // 可能由于swig模板引擎缓存的机制导致页面没有发生变化，可将swig选项中的cache设置为false，具体参考源代码72行
  watch('src/assets/styles/*.scss', style)
  watch('src/assets/scripts/*.js', script)
  watch('src/*.html', page)
  // watch('src/assets/images/**', image)
  // watch('src/assets/fonts/**', font)
  // watch('public/**', extra)
  watch([
    'src/assets/images/**',
    'src/assets/fonts/**',
    'public/**'
  ], bs.reload) // bs.reload 自动更新浏览器

  // 初始化web服务器
  bs.init({
    notify: false, // 关闭提升
    port: 2080, // 默认端口3000
    // open: false, // 自动打开浏览器，默认true
    // files: 'dist/**', // browser-sync启动后监听的文件
    server: {
      baseDir: ['temp', 'src', 'public'], // 网页根目录  添加src,public是为了提升开发阶段的构建效率
      routes: {
        '/node_modules': 'node_modules'  // 优先匹配 路由映射
      }
    }
  })
}
```

+ useref 文件引用处理

```js
// useref 文件引用处理
const useref = () => {
  return src('temp/*.html', { base: 'temp' })
    .pipe(plugins.useref({ searchPath: ['temp', '.'] }))
    // html js css
    .pipe(plugins.if(/\.js$/, plugins.uglify())) // 压缩js
    .pipe(plugins.if(/\.css$/, plugins.cleanCss())) // 压缩css
    .pipe(plugins.if(/\.html$/, plugins.htmlmin({ // 压缩html
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true
    })))
    .pipe(dest('dist'))
}
```

+ 任务组合

```js
// src目录下任务组合
const compile = parallel(style, script, page)

// 上线之前执行的任务
const build =  series(
  clean,
  parallel(
    series(compile, useref),
    image,
    font,
    extra
  )
)

// 开发任务组合
const develop = series(compile, serve)

// 导出任务
module.exports = {
  clean,
  build,
  develop
}
```

+ 补充
  + 导出任务，包装任务执行（package.json中scripts）
  + 封装自动化构建工作流
+ 目录结构

![image-20200929150910297](D:\lagou\lg_phase_one\partTwo_gch\moduleOne\image-20200929150910297.png)

+ 封装工作流

#### FIS(高度集成)

+ 基本使用
  + npm i fis3 -g 全局安装
  + fis3 release  资源定位（路径转化为绝对路径）
  + fis编译与压缩