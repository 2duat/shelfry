import * as migration_20261018_085500_initial from './20261018_085500_initial';
import * as migration_20261018_092742_add_readme from './20261018_092742_add_readme';

export const migrations = [
  {
    up: migration_20261018_085500_initial.up,
    down: migration_20261018_085500_initial.down,
    name: '20261018_085500_initial',
  },
  {
    up: migration_20261018_092742_add_readme.up,
    down: migration_20261018_092742_add_readme.down,
    name: '20261018_092742_add_readme'
  },
];
