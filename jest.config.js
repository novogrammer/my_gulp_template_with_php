
module.exports = {
  moduleFileExtensions: [
    'es6',
    'js',
  ],
  testMatch: [
    '**/*.test.js',
    '**/*.test.es6',
  ],
  transform: {
    '^.+\\.es6$': ['babel-jest'],
  },
};
