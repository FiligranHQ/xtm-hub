import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import * as React from "react";
import {graphql, PreloadedQuery, useFragment, useMutation, usePreloadedQuery, useSubscription} from "react-relay";
import {userSlugPreloaderQuery} from "../../../../__generated__/userSlugPreloaderQuery.graphql";
import {userSlugQuery} from "./user-slug-preloader";
import {userSlug_fragment$key} from "../../../../__generated__/userSlug_fragment.graphql";
import {useRouter} from "next/navigation";
import {userSlugDeletionMutation} from "../../../../__generated__/userSlugDeletionMutation.graphql";
import Button from "@mui/material/Button";
import Fab from "@mui/material/Fab";
import EditIcon from "@mui/icons-material/Edit";
import UserEdit from "./user-edit";

const fabStyle = {
    position: 'absolute',
    bottom: 16,
    right: 16,
};

const userSlugSubscription = graphql`
    subscription userSlugSubscription {
        User {
            edit {
                ...userSlug_fragment
            }
            delete {
                id @deleteRecord
            }
        }
    }
`;

const userSlugFragment = graphql`
    fragment userSlug_fragment on User {
        id
        email
        last_name
        first_name
        organization {
            id
            name
        }
    }
`;

const userSlugDeletion = graphql`
    mutation userSlugDeletionMutation($id: ID!)  {
        deleteUser(id: $id) {
            id
        }
    }
`;

interface UserSlugProps {
    queryRef: PreloadedQuery<userSlugPreloaderQuery>
}

const UserSlug: React.FunctionComponent<UserSlugProps> = ({queryRef}) => {
    const router = useRouter()
    const [openEditDialog, setOpenEditDialog] = React.useState(false)
    const data = usePreloadedQuery<userSlugPreloaderQuery>(userSlugQuery, queryRef);
    const [deleteUserMutation] = useMutation<userSlugDeletionMutation>(userSlugDeletion);
    const user = useFragment<userSlug_fragment$key>(userSlugFragment, data.user);
    useSubscription({variables: {}, subscription: userSlugSubscription});
    if (!user) { // If user not found, redirect to admin list
        router.replace('/admin/user');
    } else {
        return <>
            <Breadcrumbs aria-label="breadcrumb" sx={{pb: '14px'}}>
                <Typography variant="body2"><Link href="/">Home</Link></Typography>
                <Typography variant="body2"><Link href="/admin/user">Users</Link></Typography>
                <Typography variant="subtitle2">{user.email}</Typography>
            </Breadcrumbs>
            <div>
                <div><b>Email</b> {user.email}</div>
                <div><b>First name</b> {user.first_name}</div>
                <div><b>Last name</b> {user.last_name}</div>
                <div><b>Organization</b> {user.organization.name}</div>
            </div>
            <Button variant="contained" sx={{mt: 3, mb: 2}}
                    onClick={() => deleteUserMutation({variables: {id: user.id}})}>Delete</Button>
            {openEditDialog && <UserEdit user={user} handleClose={() => setOpenEditDialog(false)}/>}
            <Fab onClick={() => setOpenEditDialog(true)} sx={fabStyle} variant="extended" color="primary">
                <EditIcon sx={{mr: 1}}/> user
            </Fab>
        </>
    }
}

export default UserSlug;