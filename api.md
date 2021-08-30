# api docs

这是 `customize-cra-extension`的 API 文档，欢迎补充

- [`customizers`](#customizers)
  - [addDefinitionsEnvValue](#addDefinitionsEnvValue)
  - [addWebpackAliyunOssPlugin](#addWebpackAliyunOssPlugin)
  - [addSpeedMeasurePlugin](#addSpeedMeasurePlugin)
  - [addCircularDependencyPlugin](#addCircularDependencyPlugin)
  - [addZipFilesWebpack](#addZipFilesWebpack)
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

### addWebpackAliyunOssPlugin(options)

这是借助 `webpack-aliyun-oss` 插件，自动上传打包结果到 OSS 的函数。

- 因为借助了`webpack-aliyun-oss` 插件，所以使用该方法必须显式的强制在项目中安装`webpack-aliyun-oss` 插件
- 具体的 `options`参考[webpack-aliyun-oss](https://github.com/gp5251/webpack-aliyun-oss)文档，注意：**_该方法不会读取 `options` 中包含的 `accessKeyId` 和 `accessKeySecret` 两个键_**

```js
const { addWebpackAliyunOssPlugin } = require('customize-cra-extension');

module.exports = override(addWebpackAliyunOssPlugin());
```

注：`options` 的默认值：

```js
const DEFAULT_OPTIONS = {
  verbose: false,
  from: ['build/static/**'],
  dist: `static/`,
  region: 'oss-cn-hangzhou',
  endpoint: '//cdn.byai.com',
  bucket: 'by-fe-cdn',
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

### addZipFilesWebpack

这是借助 `@indata/zip-files-webpack-plugin` 插件，实现判断项目中是否存在循环依赖的函数

- 因为借助了 `@indata/zip-files-webpack-plugin` 插件，所以使用该房前必须显式的强制在项目中安装 `@indata/zip-files-webpack-plugin` 插件
- 具体的 `options`参考[@indata/zip-files-webpack-plugin](http://npm.indata.cc/package/@indata/zip-files-webpack-plugin)文档，或者咨询 @一木 大佬

```js
const { addZipFilesWebpack } = require('customize-cra-extension');

module.exports = override(addZipFilesWebpack());
```

注：`options` 的默认值：

```js
const DEFAULT_OPTIONS = {
  targetDir: './build', // 压缩目录，默认压缩名称为 htm.tar.gz
  outZipName: 'html.tar.gz',
  outPath: './', // 输出目录
};
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

## `craco`

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
