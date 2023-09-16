import * as React from "react";
import loadSerializableQuery from "@/relay/loadSerializableQuery";
import UserSlugPreloader from "./user-slug-preloader";
import userSlugPreloaderQueryGraphql, {
    userSlugPreloaderQuery
} from "../../../../__generated__/userSlugPreloaderQuery.graphql";

const Page = async ({params}: { params: { slug: string } }) => {
    const id = decodeURIComponent(params.slug);
    console.log('params.slug', id);
    const preloadedQuery = await loadSerializableQuery<typeof userSlugPreloaderQueryGraphql, userSlugPreloaderQuery>(userSlugPreloaderQueryGraphql, {id})
    return <>
        <UserSlugPreloader preloadedQuery={preloadedQuery}/>
    </>
}

export default Page;