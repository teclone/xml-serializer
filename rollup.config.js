const { config } = require('@teclone/rollup-all');
module.exports = config({
  config: {
    moduleName: 'XMLSerializer',
    entryFile: 'main.js',
    esmConfig: {
      enabled: true,
    },
    distConfig: {
      enabled: true,
    },
  },
});
