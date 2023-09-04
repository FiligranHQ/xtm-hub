"use client";

import {graphql, useMutation} from "react-relay";
import * as React from "react";
import Link from '@mui/material/Link';
import {useRouter} from 'next/navigation'

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
    return <Link onClick={logout}>Logout</Link>
}
export default HeaderLogout;
