"use client";

import * as React from "react";
import Head from 'next/head'
import styles from "styles/layout.module.css";
import {environment} from "@/relay/environment";
import {RelayEnvironmentProvider} from "react-relay";

const Layout = ({children}: { children: React.ReactNode }) => {
    return <html>
        <Head>
            <title>Filigran Cloud Portal</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <body className={styles.layout}>
            <RelayEnvironmentProvider environment={environment}>
                {children}
            </RelayEnvironmentProvider>
        </body>
    </html>;
}

export default Layout;