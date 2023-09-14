import {PreloadedQuery, usePaginationFragment, usePreloadedQuery} from "react-relay";
import {userQuery} from "../../../__generated__/userQuery.graphql";
import * as React from "react";
import {serviceQuery} from "../../../__generated__/serviceQuery.graphql";
import {UserQuery, usersFragment} from "./user-preloader";
import {user_users$key} from "../../../__generated__/user_users.graphql";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

interface ServiceProps {
    queryRef: PreloadedQuery<userQuery>
}

const UserComponent: React.FunctionComponent<ServiceProps> = ({queryRef}) => {
    const queryData = usePreloadedQuery<userQuery>(UserQuery, queryRef);
    const {data} = usePaginationFragment<serviceQuery, user_users$key>(usersFragment, queryData);
    return <TableContainer component={Paper}>
        <Table sx={{minWidth: 650}} aria-label="simple table">
            <TableHead>
                <TableRow>
                    <TableCell>Email</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {data.users.edges.map((user) => (
                    <TableRow key={user.node?.email} sx={{'&:last-child td, &:last-child th': {border: 0}}}>
                        <TableCell component="th" scope="row">{user.node?.email}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>
}

export default UserComponent;