"use client";

import {graphql, useMutation} from "react-relay";
import * as React from "react";
import Link from '@mui/material/Link';
import {useRouter} from 'next/navigation'
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import LogoutIcon from "@mui/icons-material/Logout";
import ListItemText from "@mui/material/ListItemText";

const logoutMutation = graphql`
    mutation headerLogoutMutation {
        logout
    }
`;

const HeaderLogout: React.FunctionComponent = () => {
    const router = useRouter()
    const [commitLogoutMutation] = useMutation(logoutMutation);
    const logout = () => {
        commitLogoutMutation({
            variables: {},
            onCompleted() {
                router.refresh();
            }
        })
    }
    return <ListItemButton component={Link} onClick={logout} >
        <ListItemIcon>
            <LogoutIcon />
        </ListItemIcon>
        <ListItemText primary={'Logout'} />
    </ListItemButton>
}
export default HeaderLogout;
