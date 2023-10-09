"use client";

import * as React from "react";
import Head from 'next/head'
import {environment} from "@/relay/environment";
import {RelayEnvironmentProvider} from "react-relay";
import ThemeRegistry from '@/theme/theme-registry';

// Component interface
interface AppProps {
    children: React.ReactNode
}

// Component
const App: React.FunctionComponent<AppProps> = ({children}) => {
    return <html lang="en">
    <Head>
        <title>Filigran Cloud Portal</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width"/>
    </Head>
    <body>
    <ThemeRegistry>
        { /** @ts-ignore */ }
        <RelayEnvironmentProvider environment={environment}>
            <>{children}</>
        </RelayEnvironmentProvider>
    </ThemeRegistry>
    </body>
    </html>
}

// Component export
export default App;
