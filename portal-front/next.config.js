/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    compiler: {
        relay: {
            src: "./",
            language: "typescript",
            artifactDirectory: "__generated__",
        },
    },
    async rewrites() {
        return [{
            source: '/graphql',
            destination: 'http://localhost:4001/graphql' // Proxy to Backend
        }]
    },
    experimental: {
        serverActions: true
    },
};

module.exports = nextConfig;