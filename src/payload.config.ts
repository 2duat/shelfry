import path from 'path'
import { fileURLToPath } from 'url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { en } from '@payloadcms/translations/languages/en'
import { zh } from '@payloadcms/translations/languages/zh'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Categories } from './collections/Categories'
import { CuratedLists } from './collections/CuratedLists'
import { Items } from './collections/Items'
import { Media } from './collections/Media'
import { Submissions } from './collections/Submissions'
import { SyncRuns } from './collections/SyncRuns'
import { Tags } from './collections/Tags'
import { Users } from './collections/Users'
import { Settings } from './globals/Settings'

const payloadSecret = process.env.PAYLOAD_SECRET

if (!payloadSecret && process.env.NODE_ENV === 'production') {
  throw new Error('PAYLOAD_SECRET is required in production')
}

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeDashboard: ['/components/admin/StatsPanel#StatsPanel'],
      beforeNavLinks: ['/components/admin/NavHeader#NavHeader'],
      graphics: {
        Logo: '/components/admin/Brand#Logo',
        Icon: '/components/admin/Brand#Icon',
      },
    },
    meta: {
      titleSuffix: ' · Shelfry',
    },
  },
  collections: [Items, Categories, Tags, CuratedLists, Submissions, SyncRuns, Media, Users],
  globals: [Settings],
  editor: lexicalEditor(),
  secret: payloadSecret || 'dev-only-secret',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  i18n: {
    supportedLanguages: { en, zh },
    fallbackLanguage: 'zh',
  },
})
