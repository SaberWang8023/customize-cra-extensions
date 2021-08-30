/**
 * 寻找webpack的插件
 * @param {Array} plugins webpack配置的plugins数组
 * @param {string} pluginName 插件名称
 */
export const getWebpackPlugin = (plugins, pluginName) => plugins.find((plugin) => plugin.constructor.name === pluginName);

/**
 * 将config写入webpack.config.json，用于调试
 */
export const writeConfigForDebug = () => (config) => {
  const fs = require('fs');
  const path = require('path');
  fs.writeFileSync(path.join(process.cwd(), 'webpack.config.json'), JSON.stringify(config, undefined, 2));
  return config;
};
