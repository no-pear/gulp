const { src, dest, parallel, series, watch } = require('gulp')

const del = require('del')
const browserSync = require('browser-sync')

const loadPlugins = require('gulp-load-plugins')
const plugins = loadPlugins()

const bs = browserSync.create()

const data = {
  menus: [
    {
      name: 'Home',
      icon: 'aperture',
      link: 'index.html'
    },
    {
      name: 'Features',
      link: 'features.html'
    },
    {
      name: 'About',
      link: 'about.html'
    },
    {
      name: 'Contact',
      link: '#',
      children: [
        {
          name: 'Twitter',
          link: 'https://twitter.com/w_zce'
        },
        {
          name: 'About',
          link: 'https://weibo.com/zceme'
        },
        {
          name: 'divider'
        },
        {
          name: 'About',
          link: 'https://github.com/zce'
        }
      ]
    }
  ],
  pkg: require('./package.json'),
  date: new Date()
}

// 文件清除
const clean = () => {
  return del(['dist', 'temp']) // del是外部包
}

// 样式编译
const style = () => {
  return src('src/assets/styles/*.scss', { base: 'src' })  // base 基准目录
    .pipe(plugins.sass({ outputStyle: 'expanded' })) // outputStyle: 'expanded' 完全展开
    .pipe(dest('temp'))
    .pipe(bs.reload({ stream: true }))
}

// 脚本编译
const script = () => {
  return src('src/assets/scripts/*.js', { base: 'src' })
    .pipe(plugins.babel({ presets: ['@babel/preset-env'] }))
    .pipe(dest('temp'))
    .pipe(bs.reload({ stream: true }))
}

// 页面模板编译
const page = () => {
  return src('src/*.html', { base: 'src' })
    .pipe(plugins.swig({ data, defaults: { cache: false } })) // 防止模板缓存导致页面不能及时更新
    .pipe(dest('temp'))
    .pipe(bs.reload({ stream: true }))
}

// 图片转换
const image = () => {
  return src('src/assets/images/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}

// 字体文件转换
const font = () => {
  return src('src/assets/fonts/**', { base: 'src' })
    .pipe(plugins.imagemin())
    .pipe(dest('dist'))
}

// public目录文件拷贝
const extra = () => {
  return src('public/**', { base: 'public' })
    .pipe(dest('dist'))
}

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
        '/node_modules': 'node_modules' // 优先匹配 路由映射
      }
    }
  })
}

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
  develop,
  image
}
