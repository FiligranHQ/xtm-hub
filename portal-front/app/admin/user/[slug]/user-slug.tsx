import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import * as React from "react";
import {PreloadedQuery, usePreloadedQuery} from "react-relay";
import {userSlugPreloaderQuery} from "../../../../__generated__/userSlugPreloaderQuery.graphql";
import {userSlugQuery} from "./user-slug-preloader";

interface UserSlugProps {
    queryRef: PreloadedQuery<userSlugPreloaderQuery>
}

const UserSlug: React.FunctionComponent<UserSlugProps> = ({queryRef}) => {
    const queryData = usePreloadedQuery<userSlugPreloaderQuery>(userSlugQuery, queryRef);
    return <>
        <Breadcrumbs aria-label="breadcrumb" sx={{pb: '14px'}}>
            <Typography variant="body2"><Link href="/">Home</Link></Typography>
            <Typography variant="body2"><Link href="/admin/user">Users</Link></Typography>
            <Typography variant="subtitle2">{queryData.node?.email}</Typography>
        </Breadcrumbs>
    </>
}

export default UserSlug;