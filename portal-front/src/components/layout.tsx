"use client";

import * as React from "react";
import Head from 'next/head'
import {environment} from "@/relay/environment";
import {RelayEnvironmentProvider} from "react-relay";
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';

const Layout = ({children}: { children: React.ReactNode }) => {
    return <html lang="en">
        <Head>
            <title>Filigran Cloud Portal</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <body>
            <ThemeRegistry>
                <RelayEnvironmentProvider environment={environment}>
                    {children}
                </RelayEnvironmentProvider>
            </ThemeRegistry>
        </body>
    </html>
}

export default Layout;