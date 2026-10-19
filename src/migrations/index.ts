import * as migration_20261018_085500_initial from './20261018_085500_initial';
import * as migration_20261018_092742_add_readme from './20261018_092742_add_readme';
import * as migration_20261018_101939_add_tags_task from './20261018_101939_add_tags_task';
import * as migration_20261018_115450_brand_shelfry from './20261018_115450_brand_shelfry';
import * as migration_20261018_121119_review_hardening from './20261018_121119_review_hardening';
import * as migration_20261018_152027_enrich_flag from './20261018_152027_enrich_flag';
import * as migration_20261019_000000_reset_failed_ai from './20261019_000000_reset_failed_ai';

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
    name: '20261018_115450_brand_shelfry',
  },
  {
    up: migration_20261018_121119_review_hardening.up,
    down: migration_20261018_121119_review_hardening.down,
    name: '20261018_121119_review_hardening',
  },
  {
    up: migration_20261018_152027_enrich_flag.up,
    down: migration_20261018_152027_enrich_flag.down,
    name: '20261018_152027_enrich_flag'
  },
  {
    up: migration_20261019_000000_reset_failed_ai.up,
    down: migration_20261019_000000_reset_failed_ai.down,
    name: '20261019_000000_reset_failed_ai'
  },
];
