import * as React from "react";

import "styles/globals.css";

import loadSerializableQuery from "@/relay/loadSerializableQuery";
import contextQueryNode, {contextQuery} from "../__generated__/contextQuery.graphql";
import Login from "@/components/login";
import App from "@/components/app";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LayoutMenu from "@/components/menu";
import HeaderComponent from "@/components/header";
import {DRAWER_WIDTH} from "@/utils/constant";
import LayoutPreloader from "./layout-preloader";

const RootLayout = async ({children}: { children: React.ReactNode }) => {
    try {
        const preloadedQuery = await loadSerializableQuery<typeof contextQueryNode, contextQuery>(contextQueryNode, {})
        return <App>
            <LayoutPreloader preloadedQuery={preloadedQuery}>
                <AppBar position="fixed">
                    <Toolbar sx={{backgroundColor: 'background.paper'}}>
                        <DashboardIcon sx={{color: '#444', mr: 2, transform: 'translateY(-2px)'}}/>
                        <Typography variant="h6" noWrap component="div" color="black">
                            SCRED Portal <HeaderComponent/>
                        </Typography>
                    </Toolbar>
                </AppBar>
                <LayoutMenu/>
                <Box component="main" sx={{
                    pr: '24px',
                    pl: '24px',
                    flexGrow: 1,
                    bgcolor: 'background.default',
                    ml: `${DRAWER_WIDTH}px`,
                    mt: ['68px', '76px', '84px']
                }}>
                    {children}
                </Box>
            </LayoutPreloader>
        </App>;
    } catch (e) {
        return <App>
            <Login/>
        </App>
    }
}

export default RootLayout;
