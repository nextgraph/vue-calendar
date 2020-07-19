module.exports = {
    publicPath: process.env.NODE_ENV === 'production' ? '/' : '/',
    lintOnSave: true,
    productionSourceMap: false,
    css: {
        loaderOptions: { // 向 CSS 相关的 loader 传递选项
            less: {
                javascriptEnabled: true
            }
        }
    },
    devServer: {
        port: 8080,
        https: false,
        open: true,
        proxy: {
            '/itek': {
                target: 'http://121.199.44.59/itek',
                // target: 'http://localhost:9999/pg-service',
                changeOrigin: true,
                pathRewrite: {
                    '^/itek': ''
                }
            }
        }
    }
}