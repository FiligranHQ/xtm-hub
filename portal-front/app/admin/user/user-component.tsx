import {PreloadedQuery, usePaginationFragment, usePreloadedQuery} from "react-relay";
import {userPreloaderQuery} from "../../../__generated__/userPreloaderQuery.graphql";
import * as React from "react";
import {serviceQuery} from "../../../__generated__/serviceQuery.graphql";
import {UserQuery, usersFragment} from "./user-preloader";
import {userPreloader_users$key} from "../../../__generated__/userPreloader_users.graphql";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

interface ServiceProps {
    queryRef: PreloadedQuery<userPreloaderQuery>
}

const UserComponent: React.FunctionComponent<ServiceProps> = ({queryRef}) => {
    const queryData = usePreloadedQuery<userPreloaderQuery>(UserQuery, queryRef);
    const {data} = usePaginationFragment<serviceQuery, userPreloader_users$key>(usersFragment, queryData);
    return <TableContainer component={Paper}>
        <Table sx={{minWidth: 650}} aria-label="custom pagination table">
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