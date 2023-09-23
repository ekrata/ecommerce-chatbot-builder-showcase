module.exports = {
  runtimeCaching: [
    {
      urlPattern: /login/,
      handler: 'networkOnly'
    }
  ]
};