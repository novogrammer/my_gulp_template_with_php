module.exports = {
  plugins: ['stylelint-scss'],
  extends: [
    'stylelint-config-twbs-bootstrap/scss',
    'stylelint-prettier/recommended',
  ],
  rules: {
    'selector-max-id': 1, //TODO: nullで無制限だが・・
    'unicode-bom': 'never',
    'block-no-empty': null,
    'scss/dollar-variable-pattern': null,
    'scss/at-function-pattern': null,
  },
};