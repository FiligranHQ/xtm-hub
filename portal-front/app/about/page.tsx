"use client";

import Link from "next/link";
import * as React from "react";
import {aboutSubmit} from "./aboutSubmit";


const Page = () => {
    return <>
        <div><b>ABOUT PAGE</b></div>
        <form action={aboutSubmit}>
            <button type="submit"># Invalidate path #</button>
        </form>
        <Link prefetch={false} href="/">Home</Link>
    </>
}

export default Page;