import * as migration_20261018_085500_initial from './20261018_085500_initial';
import * as migration_20261018_092742_add_readme from './20261018_092742_add_readme';
import * as migration_20261018_101939_add_tags_task from './20261018_101939_add_tags_task';
import * as migration_20261018_115450_brand_shelfry from './20261018_115450_brand_shelfry';

export const migrations = [
  {
    up: migration_20261018_085500_initial.up,
    down: migration_20261018_085500_initial.down,
    name: '20261018_085500_initial',
  },
  {
    up: migration_20261018_092742_add_readme.up,
    down: migration_20261018_092742_add_readme.down,
    name: '20261018_092742_add_readme',
  },
  {
    up: migration_20261018_101939_add_tags_task.up,
    down: migration_20261018_101939_add_tags_task.down,
    name: '20261018_101939_add_tags_task',
  },
  {
    up: migration_20261018_115450_brand_shelfry.up,
    down: migration_20261018_115450_brand_shelfry.down,
    name: '20261018_115450_brand_shelfry'
  },
];
