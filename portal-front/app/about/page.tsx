"use client";

import Link from "next/link";
import * as React from "react";


const Page = async () => {
    return <>
        <div><b>ABOUT PAGE</b></div>
        <Link prefetch={false} href="/">Home</Link>
    </>
}

export default Page;