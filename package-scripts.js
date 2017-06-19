const { series, crossEnv, concurrent, rimraf } = require('nps-utils')
const { config: { port: E2E_PORT } } = require('./test/protractor.conf')

module.exports = {
  scripts: {
    default: 'nps webpack',

    run: concurrent.nps(
      'electron',
      'webpack.build.development'
    ),


    build: 'nps webpack.build',
    release: 'build -c electron-builder.yml',
    electron: {
      default: series(
        'nps electron.compile',
        'nps electron.run'
      ),
      compile: series(rimraf("out"), 'tsc -p tsconfig.main.json'),
      run: 'cross-env NODE_ENV=development electron ./app/out',
      build: 'webpack --config webpack.config.main.js --progress -d'
    },
    webpack: {
      default: 'nps webpack.server',
      build: {
        before: rimraf('dist'),
        default: 'nps webpack.build.production',
        development: {
          default: series(
            'nps webpack.build.before',
            'webpack --watch --progress -d'
          ),
          extractCss: series(
            'nps webpack.build.before',
            'webpack --progress -d --env.extractCss'
          ),
          serve: series.nps(
            'webpack.build.development',
            'serve'
          ),
        },
        production: {
          inlineCss: series(
            'nps webpack.build.before',
            'webpack --progress -p --env.production'
          ),
          default: series(
            'nps webpack.build.before',
            'webpack --progress --env.production'
          ),
          serve: series.nps(
            'webpack.build.production',
            'serve'
          ),
        }
      },
      server: {
        default: `webpack-dev-server -d --devtool '#source-map' --inline --env.server`,
        extractCss: `webpack-dev-server -d --devtool '#source-map' --inline --env.server --env.extractCss`,
        hmr: `webpack-dev-server -d --devtool '#source-map' --inline --hot --env.server`
      },
    },
    serve: 'http-server dist --cors',
  },
}
