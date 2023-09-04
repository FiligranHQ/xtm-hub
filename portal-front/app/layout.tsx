import * as React from "react";

import "styles/globals.css";

import loadSerializableQuery from "@/relay/loadSerializableQuery";
import headerQueryNode, {headerQuery} from "../__generated__/headerQuery.graphql";
import Header from "./header";
import Login from "@/components/login/login";
import Layout from "@/components/layout";
import Footer from "./footer";

const RootLayout = async({children}: { children: React.ReactNode }) => {
    try {
        const preloadedQuery = await loadSerializableQuery<typeof headerQueryNode, headerQuery>(headerQueryNode, {})
        return <Layout>
            <Header preloadedQuery={preloadedQuery}/>
            {children}
            <Footer/>
        </Layout>;
    } catch (e) {
        return <Layout>
            <Login/>
        </Layout>
    }
}

export default RootLayout;
