/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    skipTrailingSlashRedirect: true,
    reactStrictMode: false,
    swcMinify: true,
    compiler: {
        relay: {
            src: "./",
            language: "typescript",
            artifactDirectory: "__generated__",
        },
    },
};

module.exports = nextConfig;