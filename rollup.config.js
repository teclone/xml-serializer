const { config } = require('@teclone/rollup-all');
module.exports = config({
  config: {
    moduleName: 'XMLSerializer',
    esmConfig: {
      enabled: true,
    },
    distConfig: {
      enabled: true,
    },
  },
});
