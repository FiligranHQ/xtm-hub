"use client";

import {getCurrentEnvironment} from "@/relay/environment";
import {RelayEnvironmentProvider} from "react-relay";
import * as React from "react";

const ClientComponent = ({children}: { children: React.ReactNode }) => {
    const environment = getCurrentEnvironment();
    return (
        <RelayEnvironmentProvider environment={environment}>
            {children}
        </RelayEnvironmentProvider>
    );
};

export default ClientComponent;