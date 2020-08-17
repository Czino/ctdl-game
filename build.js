import { exec } from 'child_process'
import { babel } from ("@babel/core")

babel.transform(code, {}, (err, result) => {
  result; // => { code, map, ast }
});

init()

/**
 * @description Method to initialise build
 * @returns {void}
 */
function init() {
  
}


/**
 * @description Method to lint scripts
 * @param {string} pattern file pattern
 * @returns {void}
 */
function lint(pattern) {
  pattern = pattern || config.paths.source + '/**/*.js$'
  if (!/\.js/.test(pattern)) {
    return
  }
  console.info('') // eslint-disable-line
  console.info(`Lint scripts ${pattern}`) // eslint-disable-line
  exec(`eslint ${pattern} --color`, (error, stdout) => {
    if (!error) console.info('Linting successful') // eslint-disable-line
    console.info(stdout) // eslint-disable-line
  })
}