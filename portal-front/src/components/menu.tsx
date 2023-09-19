"use client";

import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Link from "next/link";
import ListItemIcon from "@mui/material/ListItemIcon";
import HomeIcon from "@mui/icons-material/Home";
import ListItemText from "@mui/material/ListItemText";
import StarIcon from "@mui/icons-material/Star";
import ExpandLess from '@mui/icons-material/ExpandLess';
import ConnectWithoutContact from '@mui/icons-material/ConnectWithoutContact';
import DryCleaning from '@mui/icons-material/DryCleaning';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ChecklistIcon from "@mui/icons-material/Checklist";
import Settings from "@mui/icons-material/Settings";
import PeopleAlt from "@mui/icons-material/PeopleAlt";
import Collapse from "@mui/material/Collapse";
import Logout from "@/components/logout";
import * as React from "react";
import useGranted from "@/hooks/useGranted";
import {CAPABILITY_ADMIN, DRAWER_WIDTH} from "@/utils/constant";

const LayoutMenu = () => {
    const [open, setOpen] = React.useState(true);
    const isAdmin = useGranted(CAPABILITY_ADMIN)
    return <Drawer
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
        <Divider/>
        <List>
            <ListItem key={'Home'} disablePadding>
                <ListItemButton component={Link} href={'/'}>
                    <ListItemIcon>
                        <HomeIcon/>
                    </ListItemIcon>
                    <ListItemText primary={'Home'}/>
                </ListItemButton>
            </ListItem>
            <ListItem key={'Services'} disablePadding>
                <ListItemButton component={Link} href={'/service'}>
                    <ListItemIcon>
                        <StarIcon/>
                    </ListItemIcon>
                    <ListItemText primary={'Services'}/>
                </ListItemButton>
            </ListItem>
            <ListItem key={'About'} disablePadding>
                <ListItemButton component={Link} href={'/about'}>
                    <ListItemIcon>
                        <ChecklistIcon/>
                    </ListItemIcon>
                    <ListItemText primary={'About'}/>
                </ListItemButton>
            </ListItem>
            <Divider sx={{mt: 'auto'}}/>
            {isAdmin && <><ListItem key={'/admin'} disablePadding>
                <ListItemButton onClick={() => setOpen(!open)}>
                    <ListItemIcon>
                        <Settings/>
                    </ListItemIcon>
                    <ListItemText primary={'Settings'}/>
                    {open ? <ExpandLess/> : <ExpandMore/>}
                </ListItemButton>
            </ListItem>
                <Collapse in={open} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItemButton component={Link} href={'/admin/user'} sx={{pl: 4}}>
                            <ListItemIcon>
                                <PeopleAlt/>
                            </ListItemIcon>
                            <ListItemText primary="Users"/>
                        </ListItemButton>
                    </List>
                    <List component="div" disablePadding>
                        <ListItemButton component={Link} href={'/admin/service'} sx={{pl: 4}}>
                            <ListItemIcon>
                                <DryCleaning/>
                            </ListItemIcon>
                            <ListItemText primary="Services"/>
                        </ListItemButton>
                    </List>
                    <List component="div" disablePadding>
                        <ListItemButton component={Link} href={'/admin/community'} sx={{pl: 4}}>
                            <ListItemIcon>
                                <ConnectWithoutContact/>
                            </ListItemIcon>
                            <ListItemText primary="Communities"/>
                        </ListItemButton>
                    </List>
                </Collapse></>}
        </List>
        <Divider sx={{mt: 'auto'}}/>
        <List>
            <Logout/>
        </List>
    </Drawer>
}

export default LayoutMenu;