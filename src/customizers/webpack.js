import { getWebpackPlugin } from '../utilities';

/**
 * 往 ‘DefinePlugin’ 上定义内容
 * @param {Object} value 要添加的env变量对象
 */
export const addDefinitionsEnvValue = (value) => (config) => {
  const plugin = getWebpackPlugin(config.plugins, 'DefinePlugin');
  if (plugin) {
    const processEnv = plugin.definitions['process.env'] || {};
    plugin.definitions['process.env'] = {
      ...processEnv,
      ...value,
    };
  }
  return config;
};

/**
 * 添加统计打包时长插件
 * @param {Object} options “speed-measure-webpack-plugin”插件的配置
 * @param {Boolean} behindFlag 是否根据 “--analyze” 参数进行统计
 */
export const addSpeedMeasurePlugin =
  (options, behindFlag = false) =>
  (config) => {
    if (behindFlag ? process.argv.includes('--analyze') : true) {
      const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');
      const smp = new SpeedMeasurePlugin(options);
      return smp.wrap(config);
    }
    return config;
  };

/**
 * 判断import循环引用的插件
 * @param {Object} options “circular-dependency-plugin”插件的配置
 */
export const addCircularDependencyPlugin =
  (options = {}) =>
  (config) => {
    if (config.mode !== 'production') {
      const CircularDependencyPlugin = require('circular-dependency-plugin');

      const DEFAULT_OPTIONS = {
        // exclude detection of files based on a RegExp
        exclude: /node_modules/,
        // include specific files based on a RegExp
        include: /src/,
        // add errors to webpack instead of warnings
        failOnError: true,
        // allow import cycles that include an asyncronous import,
        // e.g. via import(/* webpackMode: "weak" */ './file.js')
        allowAsyncCycles: false,
        // set the current working directory for displaying module paths
        cwd: process.cwd(),
      };

      config.plugins.push(
        new CircularDependencyPlugin({
          ...DEFAULT_OPTIONS,
          ...options,
        })
      );
    }
    return config;
  };

/**
 * 添加 react-dev-inspector 的webpack插件和babel配置
 * @returns
 */
export const addReactInspectorPlugin = (options) => (config) => {
  if (config.mode !== 'production') {
    const { addBabelPlugin } = require('customize-cra');
    const { ReactInspectorPlugin } = require('react-dev-inspector/plugins/webpack');
    config.plugins.push(new ReactInspectorPlugin(options));
    return addBabelPlugin(['react-dev-inspector/plugins/babel'], options)(config);
  }

  return config;
};
