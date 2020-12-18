const { src, dest, series, parallel,watch } = require('gulp'); // yarn add gulp --dev

const del = require('del'); // yarn add del --dev
const browserSync = require('browser-sync');

const loadPlugins = require('gulp-load-plugins'); //自动加载所有插件

const plugins = loadPlugins();
const bs = browserSync.create();

// const sass = require('gulp-sass'); // yarn add gulp-sass --dev
// const babel = require('gulp-babel'); // yarn add gulp-babel @babel/core @babel/preset-env --dev
// const swig = require('gulp-swig'); // yarn add gulp-swig --dev
// const imagemin = require('gulp-imagemin'); // yarn add gulp-imagemin --dev


const data = {
    menus: [
        {
            name: 'Home',
            icon: 'aperture',
            link: 'index.html'
        },
        {
            name: 'Features',
            link: 'Features.html'
        },
        {
            name: 'About',
            link: 'About.html'
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
                },
            ]
        },

    ],
    pkg: require('./package.json'),
    date: new Date()

}

//清理 .temp 临时目录
const cleanTemp = () => {
    return del(['.temp'])
  }
  
  //清理 dist 临时目录
  const cleanDist = () => {
    return del(['dist'])
  }
  
// 编译样式文件
const style = () => {
    return src('src/assets/styles/*.scss', { base: 'src' })
        .pipe(plugins.sass({ outputStyle: 'expanded' }))
        .pipe(dest('.temp'))
}

// 编译脚本文件
// babel默认只是一个ECMAScript的转换平台，只是提供一个环境，具体去做转换的实际上是它内部的一些插件
// 而preset就是一些插件的集合
// @babel/preset-env 就是一些最新特性的整体打包
const script = () => {
    return src('src/assets/scripts/*.js', { base: 'src' })
        .pipe(plugins.babel({ presets: ['@babel/preset-env'] }))
        .pipe(dest('.temp'))
}

// 编译html模板
const page = () => {
    return src('src/*.html', { base: 'src' })
        .pipe(plugins.swig({ data, defaults: { cache: false } }))
        .pipe(dest('.temp'))
}

// 图片压缩处理
const image = () => {
    return src('src/assets/images/**', { base: 'src' })
        .pipe(plugins.imagemin())
        .pipe(dest('dist'))
}

// 字体文件复制
const font = () => {
    return src('src/assets/fonts/**', { base: 'src' })
        .pipe(plugins.imagemin()) // imagemin遇到不是图片格式的不会进行压缩
        .pipe(dest('dist'))
}

// 其他文件复制
const extra = () => {
    return src('public/**', { base: 'public' })
        .pipe(dest('dist'))
}

// 开发服务启动
const serve = () => {
    watch('src/assets/styles/*.scss',style)
    watch('src/assets/scripts/*.js',script)
    watch('src/*.html',page)
    // watch('src/assets/image/**',image)
    // watch('src/assets/fonts/**',font)
    // watch('public/**',extra)
    
    watch([
        'src/assets/image/**',
        'src/assets/fonts/**',
        'public/**'
    ], bs.reload)
    
    bs.init({
        notify: false,
        port: 1080, // 指定端口
        open: true, // 是否自动打开浏览器
        files:'.temp/**',
        server: {
            baseDir: ['.temp','src','public'], // 指定根目录
            routes: {
                '/node_modules': 'node_modules'
            }
        }
    })
}

const useref = ()=>{
    return src('*.html', {base:'.temp', cwd:'.temp'})
    .pipe(plugins.useref({ searchPath: ['.', '..'] }))

    // return src('.temp/*.html', {base:'.temp'})
    // .pipe(plugins.useref({ searchPath: ['.temp', '.'] }))

    .pipe(plugins.if(/\.js$/, plugins.uglify())) // js 代码压缩
    .pipe(plugins.if(/\.css$/, plugins.cleanCss())) // css 代码压缩
    .pipe(plugins.if(/\.html$/, plugins.htmlmin({ // html 代码压缩
      collapseWhitespace: true, // 删除空白字符
      minifyCSS: true, // style块压缩
      minifyJS: true // script块压缩
    })))
    .pipe(dest('dist'))
}

// 清除所有
const clean = parallel(cleanTemp, cleanDist);

// 编译任务：先清除 .temp 目录，然后并行执行 style, script, page 分别对样式文件、脚本文件、模板文件进行编译
const compile = series(cleanTemp, parallel(style, script, page))

// 构建任务：先清除 .temp和dist 目录
// 然后执行编译任务后将样式文件、脚本文件、模板文件进行压缩
// 再然后将图片压缩复制、字体文件复制、其它文件复制到 dist 目录
// 最后清除 .temp 临时目录
const build = series(cleanDist, parallel(series(compile, useref), image, font, extra), cleanTemp)

// 开发热启动服务器
// 先编译相关文件，然后启动服务器，并用watch持续监听文件更改，监听到文件变化，watch会执行响应的编译任务，
// browserSync监听的目录更新后会刷新浏览器页面
const develop = series(compile, serve)

module.exports = {
  build,
  develop,
  clean,
  useref
}