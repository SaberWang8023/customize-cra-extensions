/**
Copyright (c) 2018-present, Form  Nathan Broadbent & DocSpring 
https://docspring.com
hello@docspring.com

MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// https://github.com/DocSpring/craco-less
// 本代码灵感来自于 craco-less，修改为兼容 less module 形式


const path = require('path');

const overrideWebpackConfig = ({ context, webpackConfig, pluginOptions }) => {
  const { getLoader, loaderByName } = require('@craco/craco');
  // 解决windows系统目录写法问题
  const pathSep = path.sep;

  const lessModuleRegex = /\.module\.(less)$/;

  pluginOptions = pluginOptions || {};

  const oneOfRule = webpackConfig.module.rules.find((rule) => rule.oneOf);
  if (!oneOfRule) {
    throw new Error(`Can't find a 'oneOf' rule under module.rules in the ${context.env} webpack config!`);
  }

  const sassModuleRule = oneOfRule.oneOf
    .filter((rule) => rule.test && rule.test.toString().includes('scss|sass'))
    .find((rule) => rule.test && rule.test.toString().includes('module'));

  if (!sassModuleRule) {
    throw new Error(`Can't find the webpack rule to match *.module.(scss|sass) files in the ${context.env} webpack config!`);
  }

  let lessModuleRule = {
    test: lessModuleRegex,
    use: [],
  };

  // 仿照sassModuleRule遍历出lessModuleRule
  const loaders = sassModuleRule.use;
  loaders.forEach((ruleOrLoader) => {
    let rule;
    if (typeof ruleOrLoader === 'string') {
      rule = {
        loader: ruleOrLoader,
        options: {},
      };
    } else {
      rule = ruleOrLoader;
    }

    if ((context.env === 'development' || context.env === 'test') && rule.loader.includes(`${pathSep}style-loader${pathSep}`)) {
      lessModuleRule.use.push({
        loader: rule.loader,
        options: {
          ...rule.options,
          ...(pluginOptions.styleLoaderOptions || {}),
        },
      });
    } else if (rule.loader.includes(`${pathSep}css-loader${pathSep}`)) {
      lessModuleRule.use.push({
        loader: rule.loader,
        options: {
          ...rule.options,
          ...(pluginOptions.cssLoaderOptions || {}),
        },
      });
    } else if (rule.loader.includes(`${pathSep}postcss-loader${pathSep}`)) {
      lessModuleRule.use.push({
        loader: rule.loader,
        options: {
          ...rule.options,
          ...(pluginOptions.postcssLoaderOptions || {}),
        },
      });
    } else if (rule.loader.includes(`${pathSep}resolve-url-loader${pathSep}`)) {
      lessModuleRule.use.push({
        loader: rule.loader,
        options: {
          ...rule.options,
          ...(pluginOptions.resolveUrlLoaderOptions || {}),
        },
      });
    } else if (context.env === 'production' && rule.loader.includes(`${pathSep}mini-css-extract-plugin${pathSep}`)) {
      lessModuleRule.use.push({
        loader: rule.loader,
        options: {
          ...rule.options,
          ...(pluginOptions.miniCssExtractPluginOptions || {}),
        },
      });
    } else if (rule.loader.includes(`${pathSep}sass-loader${pathSep}`)) {
      const defaultLessLoaderOptions = context.env === 'production' ? { sourceMap: true } : {};
      lessModuleRule.use.push({
        loader: require.resolve('less-loader'),
        options: {
          ...defaultLessLoaderOptions,
          ...pluginOptions.lessLoaderOptions,
        },
      });
    } else {
      throw new Error(`Found an unhandled loader in the ${context.env} webpack config: ${rule.loader}`);
    }
  });

  if (typeof pluginOptions.modifyLessModuleRule === 'function') {
    lessModuleRule = pluginOptions.modifyLessModuleRule(lessModuleRule, context);
  }
  oneOfRule.oneOf.push(lessModuleRule);

  const { isFound, match: fileLoaderMatch } = getLoader(webpackConfig, loaderByName('file-loader'));
  if (!isFound) {
    throw new Error(`Can't find file-loader in the ${context.env} webpack config!`);
  }
  fileLoaderMatch.loader.exclude.push(lessModuleRegex);

  return webpackConfig;
};

export const cracoLessModulePlugin = {
  overrideWebpackConfig,
  pathSep: path.sep,
};
