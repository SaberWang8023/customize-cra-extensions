# customize-cra-extensions

## 写在前面

本项目灵感来自于 [customize-cra](https://github.com/arackaf/customize-cra)

## 概要

是一个适用于 [react-app-rewired](https://github.com/timarney/react-app-rewired#readme) 和 [craco](https://github.com/gsoft-inc/craco#craco) 的扩展配置工具，提供了一些工具方法用于便捷配置 react-app-rewired 和 craco

---

## api docs

这是 `customize-cra-extensions`的 API 文档，欢迎补充

- [`customizers`](#customizers)
  - [addDefinitionsEnvValue](#addDefinitionsEnvValue)
  - [addSpeedMeasurePlugin](#addSpeedMeasurePlugin)
  - [addCircularDependencyPlugin](#addCircularDependencyPlugin)
  - [addReactInspectorPlugin](#addReactInspectorPlugin)
- [`utilities`](#utilities)
  - [getWebpackPlugin](#getWebpackPlugin)
  - [writeConfigForDebug](#writeConfigForDebug)
- [`craco`](#craco)
  - [cracoLessModulePlugin](#cracoLessModulePlugin)

## `customizers`

`customizers` 是对配置对象进行修改的函数，允许用户轻松启用或禁用`webpack`、`webpack-dev-server`、`babel`等相关配置功能。

### addDefinitionsEnvValue(value)

这是往 `webpack.DefinePlugin` 插件定义的内容上扩展自定义环境变量值的函数

- `value`对象中的值，除`Boolean`和 `Number`，其余必须经过 `JSON.stringify` 转成字符串

```js
const { addDefinitionsEnvValue } = require('customize-cra-extension');

module.exports = override(
  addDefinitionsEnvValue({
    API_ENV: JSON.stringify(process.env.API_ENV || process.env.bamboo_API_ENV),
  })
);
```

代码中使用：

```js
const config = function () {
  const API_ENV = process.env.API_ENV;
  if (API_ENV === 'test') {
    return Object.assign({}, test);
  }
  if (API_ENV === 'pre') {
    return Object.assign({}, pre);
  }
  if (API_ENV === 'prod') {
    return Object.assign({}, prod);
  }
  return Object.assign({}, dev);
};
```

### addSpeedMeasurePlugin(options,behindFlag)

这是借助 `speed-measure-webpack-plugin` 插件，统计打包时长的函数。

- 因为借助了`speed-measure-webpack-plugin` 插件，所以使用该方法必须显式的强制在项目中安装`speed-measure-webpack-plugin` 插件
- 具体的 `options`参考[speed-measure-webpack-plugin](https://github.com/stephencookdev/speed-measure-webpack-plugin)文档

```js
const { addSpeedMeasurePlugin } = require('customize-cra-extension');

module.exports = override(addSpeedMeasurePlugin({}, true));
```

### addCircularDependencyPlugin(options)

这是借助 `circular-dependency-plugin` 插件，实现判断项目中是否存在循环依赖的函数

- 因为借助了 `circular-dependency-plugin` 插件，所以使用该方法必须显式的强制在项目中安装 `circular-dependency-plugin` 插件
- 具体的 `options`参考[circular-dependency-plugin](https://github.com/aackerman/circular-dependency-plugin)文档

```js
const { addCircularDependencyPlugin } = require('customize-cra-extension');

module.exports = override(addCircularDependencyPlugin());
```

### addReactInspectorPlugin

这是借助 `react-dev-inspector` 插件，实现判断项目中是否存在循环依赖的函数

- 因为借助了 `react-dev-inspector` 插件，所以使用该房前必须显式的强制在项目中安装 `react-dev-inspector` 插件
- 具体的 `options`参考[react-dev-inspector](https://github.com/zthxxx/react-dev-inspector#inspector-babel-plugin-options)文档

```js
const { addReactInspectorPlugin } = require('customize-cra-extension');

module.exports = override(addReactInspectorPlugin());
```

## `utilities`

`utilities` 是供 `customizers` 内的函数控制调用用的，也可以借助这里面的函数实现自己想要自定义的功能

### getWebpackPlugin(plugins, pluginName)

返回 `plugins`中指定的 `pluginName`的插件配置对象

```js
const { getWebpackPlugin } = require('customize-cra-extension');

const addDefinitionsEnvValue = (value) => (config) => {
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
module.exports = override(addDefinitionsEnvValue({ API_ENV: JSON.stringify('dev') }));
```

### writeConfigForDebug()

开发调试用，将 `config` 写入 `webpack.config.json` 文件

```js
const { writeConfigForDebug } = require('customize-cra-extension');

module.exports = override(writeConfigForDebug());
```

### `cracoLessModulePlugin`

这是一个 `craco` 的插件，主要用于 `craoc.config.js` 配置 `less-module`，使用此插件后，只需将 `less` 文件命名为 `*.module.less` 的格式，既可支持`less-module`.

使用方法：

```js
// craoc.config.js
module.exports = {
  plugins: [
    {
      plugin: cracoLessModulePlugin,
    },
  ],
};
```
