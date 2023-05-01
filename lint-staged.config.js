module.exports = {
  // this will check Typescript files
  '**/*.(ts|tsx)': () => 'turbo tsc -- --noEmit',

  // This will lint and format TypeScript and                                             //JavaScript files
  '**/*.(ts|tsx|js)': (filenames) => [
    `eslint --fix ${filenames.join(' ')}`,
    `turbo prettier -- --write ${filenames.join(' ')}`,
    `turbo storybook`,
    `turbo test-storybook`,
  ],

  // this will Format MarkDown and JSON
  '**/*.(md|json)': (filenames) =>
    `turbo prettier -- --write ${filenames.join(' ')}`,
};
