module.exports = {
  // this will check Typescript files
  '**/*.(ts|tsx)': () => 'turbo tsc --noEmit',

  // This will lint and format TypeScript and                                             //JavaScript files
  '**/*.(ts|tsx|js)': (filenames) => [
    `turbo lint -- --fix ${filenames.join(' ')}`,
    `turbo prettier --write ${filenames.join(' ')}`,
  ],

  // this will Format MarkDown and JSON
  '**/*.(md|json)': (filenames) =>
    `turbo prettier --write ${filenames.join(' ')}`,
};
