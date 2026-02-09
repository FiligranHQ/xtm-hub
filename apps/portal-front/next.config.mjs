import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  redirects: async () => {
    return [
      {
        source: '/app/service/free-trial',
        destination: '/app/service/opencti-free-trial',
        permanent: true,
      },
      
      // open-bas / obas → openaev
      {
        source: '/app/service/(open-bas-scenarios|obas_scenarios)/:path*',
        destination: '/app/service/openaev_scenarios/:path*',
        permanent: true,
      },

      // octi integration feeds → opencti integrations
      {
        source:
          '/app/service/(octi_integration_feeds|open-cti-integration-feeds)/:path*',
        destination: '/app/service/opencti_integrations/:path*',
        permanent: true,
      },

      // octi custom dashboards → opencti custom dashboards
      {
        source: '/app/service/octi_custom_dashboards/:path*',
        destination: '/app/service/opencti_custom_dashboards/:path*',
        permanent: true,
      },

      // -------------------------
      // Cybersecurity solutions
      // -------------------------

      {
        source: '/cybersecurity-solutions/free-trial',
        destination: '/cybersecurity-solutions/opencti-free-trial',
        permanent: true,
      },

      {
        source:
          '/cybersecurity-solutions/(open-bas-scenarios|obas-scenarios)/:path*',
        destination: '/cybersecurity-solutions/open-aev-scenarios/:path*',
        permanent: true,
      },

      {
        source:
          '/cybersecurity-solutions/(octi_integration_feeds|open-cti-integration-feeds)/:path*',
        destination: '/cybersecurity-solutions/open-cti-integrations/:path*',
        permanent: true,
      },

      {
        source: '/cybersecurity-solutions/octi_custom_dashboards/:path*',
        destination:
          '/cybersecurity-solutions/open-cti-custom-dashboards/:path*',
        permanent: true,
      },
    ];
  },
  output: 'standalone',
  logging: {
    fetches: {
      fullUrl:
        process.env.NODE_ENV !== 'production' &&
        process.env.NODE_ENV !== 'staging',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '**',
        search: '',
      },
    ],
  },
  skipTrailingSlashRedirect: true,
  reactStrictMode: true,
  compiler: {
    relay: {
      src: './',
      language: 'typescript',
      artifactDirectory: '__generated__',
    },
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  webpack(config) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    );

    config.module.rules.push(
      // Reapply the existing rule, but only for svg imports ending in ?url
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
        use: ['@svgr/webpack'],
      }
    );

    // Modify the file loader rule to ignore *.svg, since we have it handled now.
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
};

export default withNextIntl(nextConfig);
