import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
}

export default withPayload(nextConfig)
