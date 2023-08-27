import {Deployment, Resolvers} from "../__generated__/resolvers-types.js";

const deployments: Deployment[] = [
    {
        name: 'The Awakening',
        description: 'Kate Chopin',
    },
    {
        name: 'City of Glass',
        description: 'Paul Auster',
    },
];

const resolvers: Resolvers = {
    Query: {
        deployments: () => deployments,
    },
};

export default resolvers;