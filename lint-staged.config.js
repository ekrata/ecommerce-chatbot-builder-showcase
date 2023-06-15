module.exports = {
  // this will check Typescript files
  '**/*.(ts|tsx)': () => 'pnpm tsc',

  // // This will lint and format TypeScript and                                             //JavaScript files
  // '**/*.(ts|tsx|js)': (filenames) => [
  //   `eslint --fix ${filenames.join(' ')}`,
  //   `pnpm prettier -- --write ${filenames.join(' ')}`,
  //   // `pnpm test-app-storybook`,
  // ],

  // // this will Format MarkDown and JSON
  // '**/*.(md|json)': (filenames) =>
  //   `pnpm prettier -- --write ${filenames.join(' ')}`,
};
