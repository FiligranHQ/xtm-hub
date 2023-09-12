import * as React from "react";

import "styles/globals.css";

import loadSerializableQuery from "@/relay/loadSerializableQuery";
import headerQueryNode, {headerQuery} from "../__generated__/headerQuery.graphql";
import Header from "./header";
import Link from 'next/link';
import Login from "@/components/login/login";
import Layout from "@/components/layout";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import DashboardIcon from "@mui/icons-material/Dashboard";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import StarIcon from '@mui/icons-material/Star';
import ChecklistIcon from '@mui/icons-material/Checklist';
import LogoutIcon from '@mui/icons-material/Logout';
import HeaderLogout from "@/components/header/header-logout";

const DRAWER_WIDTH = 240;

const LINKS = [
    { text: 'Home', href: '/', icon: HomeIcon },
    { text: 'Services', href: '/service', icon: StarIcon },
    { text: 'About', href: '/about', icon: ChecklistIcon },
];

const RootLayout = async({children}: { children: React.ReactNode }) => {
    try {
        const preloadedQuery = await loadSerializableQuery<typeof headerQueryNode, headerQuery>(headerQueryNode, {})
        return <Layout>
            <AppBar position="fixed" sx={{ zIndex: 2000 }}>
                <Toolbar sx={{ backgroundColor: 'background.paper' }}>
                    <DashboardIcon sx={{ color: '#444', mr: 2, transform: 'translateY(-2px)' }} />
                    <Typography variant="h6" noWrap component="div" color="black">
                        Cloud Portal <Header preloadedQuery={preloadedQuery}/>
                    </Typography>
                </Toolbar>
            </AppBar>
            <Drawer
                sx={{
                    width: DRAWER_WIDTH,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        boxSizing: 'border-box',
                        top: ['48px', '56px', '64px'],
                        height: 'auto',
                        bottom: 0,
                    },
                }}
                variant="permanent"
                anchor="left">
                <Divider />
                <List>
                    {LINKS.map(({ text, href, icon: Icon }) => (
                        <ListItem key={href} disablePadding>
                            <ListItemButton component={Link} href={href}>
                                <ListItemIcon>
                                    <Icon />
                                </ListItemIcon>
                                <ListItemText primary={text} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
                <Divider sx={{ mt: 'auto' }} />
                <List>
                    <ListItem key={'Logout'} disablePadding>
                        <ListItemButton>
                            <ListItemIcon>
                                <LogoutIcon />
                            </ListItemIcon>
                            <HeaderLogout/>
                        </ListItemButton>
                    </ListItem>
                </List>
            </Drawer>
            <Box component="main"
                 sx={{
                     flexGrow: 1,
                     bgcolor: 'background.default',
                     ml: `${DRAWER_WIDTH}px`,
                     mt: ['68px', '76px', '84px'],
                 }}>
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    {children}
                </Container>
            </Box>
        </Layout>;
    } catch (e) {
        return <Layout>
            <Login/>
        </Layout>
    }
}

export default RootLayout;
