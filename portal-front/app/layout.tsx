import * as React from "react";

import "styles/globals.css";

import loadSerializableQuery from "@/relay/loadSerializableQuery";
import contextQueryNode, {contextQuery} from "../__generated__/contextQuery.graphql";
import Login from "@/components/login/login";
import Layout from "@/components/layout";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from '@mui/material/Container';
import LayoutMenu from "@/components/menu";
import Context from "./context";
import HeaderComponent from "@/components/header/header";
import {DRAWER_WIDTH} from "@/constant";

const RootLayout = async ({children}: { children: React.ReactNode }) => {
    try {
        const preloadedQuery = await loadSerializableQuery<typeof contextQueryNode, contextQuery>(contextQueryNode, {})
        return <Layout>
            <Context preloadedQuery={preloadedQuery}>
                <AppBar position="fixed" sx={{zIndex: 2000}}>
                    <Toolbar sx={{backgroundColor: 'background.paper'}}>
                        <DashboardIcon sx={{color: '#444', mr: 2, transform: 'translateY(-2px)'}}/>
                        <Typography variant="h6" noWrap component="div" color="black">
                            SCRED Portal <HeaderComponent/>
                        </Typography>
                    </Toolbar>
                </AppBar>
                <LayoutMenu/>
                <Box component="main" sx={{
                    flexGrow: 1,
                    bgcolor: 'background.default',
                    ml: `${DRAWER_WIDTH}px`,
                    mt: ['68px', '76px', '84px']
                }}>
                    <Container maxWidth="lg" sx={{mt: 4, mb: 4}}>
                        {children}
                    </Container>
                </Box>
            </Context>
        </Layout>;
    } catch (e) {
        return <Layout>
            <Login/>
        </Layout>
    }
}

export default RootLayout;
