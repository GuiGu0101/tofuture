// 增加静态目录变量
fis.set('statics', 'static');
fis.set('namespace', '');
fis.set('project.version', '1.0.0');
fis.set('project.qaVersion', '1.0.0');
fis.set('project.prodVersion', '1.0.0');
// 标记 staitc/libs 下面的 js 为模块化代码。
fis.match('/static/libs/**.js', {
    isMod: true
});

// jello 里面默认用的 commonjs 这里改成 amd 方案。
fis.unhook('commonjs');
fis.hook('amd', {
    packages: [
        // 用来存放 libs 库
        {
            name: 'libs',
            location: 'static/libs/',
            main: 'index'
        }
    ]
});
// 设置 *.scss 配置配置项
fis.match('*.scss', {
    rExt: '.css',
    parser: fis.plugin('node-sass-qt', {
        include_paths: [
            './static/scss',
            './components/compass-mixins'
        ]
    })
});

// 不启用 less
fis.match('*.less', {
    parser: null
});

fis.match('::package', {
    postpackager: fis.plugin('loader', {})
});

fis.match('**.{svg,png,jpg,gif}', {
        release: '${namespace}/${statics}/images/$0'
    })
    .match('**.js', {
        release: '${namespace}/${statics}/js/$0'
    })
    .match('**.{css,scss}', {
        release: '${namespace}/${statics}/css/$0'
    })
    .match('/static/(**)', {
        release: '${namespace}/${statics}/$1'
    })
    .match('**.{jsp,vm,html}', {
        isMod: true,
        url: '$0',
        release: '${namespace}/$0',
        extras: {
            isPage: true
        }
    })
    // _ 下划线打头的都是不希望被产出的文件。
    .match('_*.*', {
        release: false
    })
var package_option = {
    'pkg/frame.css': [
        '/static/scss/**.css',
        '/static/scss/global.scss',
        '/comp/**.scss',
    ],
    'pkg/boot.js': [
        'static/js/require.js',
        'components/jquery/jquery.js',
        'static/js/global.js',
        '/comp/**.js' // 匹配依赖部分
    ]
};
fis.media('package-test')
    .match('::package', {
        // 关于打包配置，请参考：https://github.com/fex-team/fis3-packager-deps-pack
        packager: fis.plugin('deps-pack', package_option),
        spriter: fis.plugin('csssprites')
    })
    .match('*.js', {
        optimizer: fis.plugin('uglify-js'),
    })
    .match('*.{css,scss}', {
        optimizer: fis.plugin('clean-css')
    })
    .match('*.png', {
        optimizer: fis.plugin('png-compressor')
    })
    .match('*.{css,scss,js}', {
        useHash: true
    });

fis.media('release')
    .match('**', {
        domain:'//paywhere.fast.im/wap',
        deploy: [
            fis.plugin('tar', {
                filename: 'tofuture-' + fis.get('project.prodVersion') + '.tar.gz'
            }),
            fis.plugin('local-deliver', {
                to: './output'
            })
        ]
    })
    .match('*.html', {
        postprocessor: function (content, file, settings) {
            //预处理时,替换测试环境地址为正式环境地址
            content = content.replace(/devqt/g, '');
            //压缩html代码
            content = content.replace(/\r\n\s*/g, ' ');
            content = content.replace(/\n\s*/g, ' ');
            //增加jpg转换代码
            content = content.replace(/\.jpg"/g, '.jpg?version='+ fis.get('project.prodVersion') +'"');
            //增加png版本代码
            content = content.replace(/\.png"/g, '.png?version='+ fis.get('project.prodVersion') +'"');
            return content;
        }
        
    })
    .match('*.js', {
        postprocessor: function (content, file, settings) {
            //预处理时,替换测试环境地址为正式环境地址
            content = content.replace(/devqt/g, '');
            // 预处理时，注释console函数
            content = content.replace(/console/g, '// console');
            return content;
        }
    })
    .match('::package', {
        // 关于打包配置，请参考：https://github.com/fex-team/fis3-packager-deps-pack
        packager: fis.plugin('deps-pack', package_option)
    })
    .match('*.js', {
        optimizer: fis.plugin('uglify-js'),
    })
    .match('*.{css,scss}', {
        optimizer: fis.plugin('clean-css')
    })
    .match('*.png', {
        optimizer: fis.plugin('png-compressor')
    })
    .match('*.{css,scss,js}', {
        useHash: true
    })
    .match('{LICENSE,package*.json,README.md,bs-config.js}',{
        release: false
    })

