"use client";

import * as React from "react";
import {useContext} from "react";
import {Portal, portalContext} from "./context";

const HeaderComponent: React.FunctionComponent = () => {
    const { me } = useContext<Portal>(portalContext);
    return <span>({me?.email})</span>
}
export default HeaderComponent;
