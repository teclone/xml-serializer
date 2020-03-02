const { config } = require('@teclone/rollup-all');
module.exports = config({
  config: {
    esmConfig: {
      enabled: true,
    },
    distConfig: {
      enabled: true,
    },
  },
});
