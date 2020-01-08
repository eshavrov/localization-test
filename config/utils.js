const getCacheGroups = (list, commonChunkName) => {
  const acc = {};

  const common = { chunks: "all" };

  list.forEach(([moduleRegExp, name = moduleRegExp]) => {
    acc[name] = {
      ...common,
      test: RegExp(`[\/]node_modules[\/]((${moduleRegExp}).*)`),
      name
    };
  });

  const excludedModules = list.map(([moduleRegExp]) => moduleRegExp).join("|");

  acc.commons = {
    ...common,
    test: RegExp(`[\/]node_modules[\/]((?!(${excludedModules})).*)`),
    name: "common"
  };

  return acc;
};

module.exports = { getCacheGroups };
