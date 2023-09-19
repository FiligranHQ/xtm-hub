import * as React from "react";
import preloaderServiceQueryNode, {preloaderServiceQuery} from "../../__generated__/preloaderServiceQuery.graphql";
import Preloader from "./preloader";
import loadSerializableQuery from "@/relay/loadSerializableQuery";

// Configuration or Preloader Query
const DEFAULT_COUNT = 10;

// Component interface
interface PageProps {
}

// Component
const Page: React.FunctionComponent<PageProps> = async () => {
    const preloadedQuery = await loadSerializableQuery<typeof preloaderServiceQueryNode, preloaderServiceQuery>(preloaderServiceQueryNode, {
        count: DEFAULT_COUNT,
        orderBy: "name",
        orderMode: "asc"
    })
    return <>
        <div><b>SERVICE</b></div>
        <Preloader preloadedQuery={preloadedQuery}/>
    </>
}

// Component export
export default Page;