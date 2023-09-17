import {PreloadedQuery, usePaginationFragment, usePreloadedQuery} from "react-relay";
import {userPreloaderQuery} from "../../../__generated__/userPreloaderQuery.graphql";
import * as React from "react";
import {serviceQuery} from "../../../__generated__/serviceQuery.graphql";
import {UserQuery, usersFragment} from "./user-list-preloader";
import {userPreloader_users$key} from "../../../__generated__/userPreloader_users.graphql";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import UserListCreate from "./user-list-create";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {fabStyle} from "@/constant";

interface ServiceProps {
    queryRef: PreloadedQuery<userPreloaderQuery>
}

const UserList: React.FunctionComponent<ServiceProps> = ({queryRef}) => {
    const [openCreateDialog, setOpenCreateDialog] = React.useState(false)
    const router = useRouter()
    const queryData = usePreloadedQuery<userPreloaderQuery>(UserQuery, queryRef);
    const {data} = usePaginationFragment<serviceQuery, userPreloader_users$key>(usersFragment, queryData);
    return <>
        <Breadcrumbs aria-label="breadcrumb" sx={{pb: '14px'}}>
            <Typography variant="body2"><Link href="/">Home</Link></Typography>
            <Typography variant="subtitle2">Users</Typography>
        </Breadcrumbs>
        <TableContainer component={Paper}>
            <Table sx={{minWidth: 650}} aria-label="custom pagination table">
                <TableBody>
                    {data.users.edges.map((user) => (
                        <TableRow key={user.node?.id} onClick={() => router.push(`/admin/user/${user.node?.id}`)}
                                  sx={{'&:last-child td, &:last-child th': {border: 0}}}>
                            <TableCell component="th" scope="row">{user.node?.email}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        {openCreateDialog &&
            <UserListCreate connectionID={data?.users?.__id} handleClose={() => setOpenCreateDialog(false)}/>}
        <Fab onClick={() => setOpenCreateDialog(true)} sx={fabStyle} variant="extended" color="primary">
            <AddIcon sx={{mr: 1}}/> user
        </Fab>
    </>
}

export default UserList;