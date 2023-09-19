"use client";

import * as React from "react";
import {useContext} from "react";
import {Portal, portalContext} from "./context";

// Component interface
interface HeaderComponentProps {
}

// Component
const HeaderComponent: React.FunctionComponent<HeaderComponentProps> = () => {
    const {me} = useContext<Portal>(portalContext);
    return <span>({me?.email})</span>
}

// Component export
export default HeaderComponent;
