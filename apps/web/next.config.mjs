import createNextIntlPlugin from '@workspace/i18n/plugin';

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