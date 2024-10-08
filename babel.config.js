module.exports = api => {
  api.cache(false)
  return {
    presets: [
      '@babel/preset-env'
    ],
    plugins: [
      [
        '@babel/plugin-proposal-class-properties'
      ],
      '@babel/plugin-transform-spread',
      '@babel/plugin-proposal-object-rest-spread',
      '@babel/plugin-transform-runtime'
    ]
  }
}
