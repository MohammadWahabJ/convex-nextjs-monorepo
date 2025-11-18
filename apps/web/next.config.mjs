// Import directly from next-intl to avoid TypeScript compilation issues
// The @workspace/i18n/plugin just re-exports this, so this is equivalent
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/i18n"],
  devIndicators: false,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/assistant",
        permanent: false,
      },
    ]
  }
}

export default withNextIntl(nextConfig);