import { Pool } from 'pg';

const pool = new Pool({
    user: process.env.E2E_BASE_URL ? process.env.POSTGRES_USER: "portal",
    host: process.env.E2E_BASE_URL ? process.env.DATABASE_HOST:"127.0.0.1",
    database:process.env.E2E_BASE_URL ? process.env.POSTGRES_DB:"cloud-portal",
    password: process.env.E2E_BASE_URL ? process.env.POSTGRES_PASSWORD:"portal-password",
    port:process.env.E2E_BASE_URL ? process.env.DATABASE_PORT: 5432,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
