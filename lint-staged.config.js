module.exports = {
  '**/*.ts?(x)': () => 'tsc -p tsconfig.json --noEmit',
  '*.{js,jsx,ts,tsx}': 'eslint --cache --fix',
  '*.{js,jsx,ts,tsx,json}': 'prettier --write'
}
