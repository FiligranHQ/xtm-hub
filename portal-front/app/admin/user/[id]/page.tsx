import * as React from "react";
import loadSerializableQuery from "@/relay/loadSerializableQuery";
import UserSlugPreloader from "./user-slug-preloader";
import { redirect } from 'next/navigation'
import userSlugPreloaderQueryGraphql, {
    userSlugPreloaderQuery
} from "../../../../__generated__/userSlugPreloaderQuery.graphql";

const Page = async ({params}: { params: { id: string } }) => {
    const id = decodeURIComponent(params.id);
    try {
        const preloadedQuery = await loadSerializableQuery<typeof userSlugPreloaderQueryGraphql, userSlugPreloaderQuery>(userSlugPreloaderQueryGraphql, {id})
        return <UserSlugPreloader preloadedQuery={preloadedQuery}/>
    } catch(e) { // If error at user loading, redirect to the list
        redirect('/admin/user')
    }
}

export default Page;