"use client";

import {graphql, useMutation} from "react-relay";
import * as React from "react";
import Link from '@mui/material/Link';
import {useRouter} from 'next/navigation'
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import LogoutIcon from "@mui/icons-material/Logout";
import ListItemText from "@mui/material/ListItemText";

// Relay
const LogoutMutation = graphql`
    mutation logoutMutation {
        logout
    }
`;

// Component interface
interface LogoutProps {
}

// Component
const Logout: React.FunctionComponent<LogoutProps> = () => {
    const router = useRouter()
    const [commitLogoutMutation] = useMutation(LogoutMutation);
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

// Component export
export default Logout;
