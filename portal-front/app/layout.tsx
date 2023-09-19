import * as React from "react";

import "styles/globals.css";

import loadSerializableQuery from "@/relay/loadSerializableQuery";
import preloaderLayoutQueryNode, {preloaderLayoutQuery} from "../__generated__/preloaderLayoutQuery.graphql";
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
import Preloader from "./preloader";

// Configuration or Preloader Query

// Component interface
interface RootLayoutProps {
    children: React.ReactNode
}

// Component
const RootLayout: React.FunctionComponent<RootLayoutProps> = async ({children}) => {
    try {
        const preloadedQuery = await loadSerializableQuery<typeof preloaderLayoutQueryNode, preloaderLayoutQuery>(preloaderLayoutQueryNode, {})
        return <App>
            <Preloader preloadedQuery={preloadedQuery}>
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
            </Preloader>
        </App>;
    } catch (e) {
        return <App>
            <Login/>
        </App>
    }
}

// Component export
export default RootLayout;
