"use client";

import * as React from "react";
import styles from "styles/layout.module.css";
import {environment} from "@/relay/environment";
import {RelayEnvironmentProvider} from "react-relay";

const Layout = ({children}: { children: React.ReactNode }) => {
    return <html>
        <head>
            <title>Filigran Cloud Portal</title>
        </head>
        <body className={styles.layout}>
            <RelayEnvironmentProvider environment={environment}>
                {children}
            </RelayEnvironmentProvider>
        </body>
    </html>;
}

export default Layout;