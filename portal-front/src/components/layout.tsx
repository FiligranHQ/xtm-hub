"use client";

import * as React from "react";
import styles from "styles/layout.module.css";
import ClientComponent from "../../app/client";

const Layout = ({children}: { children: React.ReactNode }) => {
    return <html>
        <head>
            <title>Filigran Cloud Portal</title>
        </head>
        <body className={styles.layout}>
            <ClientComponent>
                {children}
            </ClientComponent>
        </body>
    </html>;
}

export default Layout;