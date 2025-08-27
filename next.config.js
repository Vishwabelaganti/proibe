const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  assetPrefix: isProd ? '/proibe/' : '',
  basePath: isProd ? '/proibe' : '',
  trailingSlash: true,
  output: isProd ? 'export' : undefined,
};
