'use client';
import React, { FunctionComponent } from 'react';
import Logout from "@/components/logout";
import {LogoutIcon} from "filigran-icon";
import {cn} from "@/lib/utils";
import {Button} from "filigran-ui/servers";
import {useMutation} from "react-relay";
import {LogoutMutation} from "@/components/logout.graphql";
import {useRouter} from "next/navigation";

// Component
const NotAuthorized: FunctionComponent = () => {
    const router = useRouter();

    const [commitLogoutMutation] = useMutation(LogoutMutation);
    const logout = () => {
        commitLogoutMutation({
            variables: {},
            onCompleted() {
                router.refresh();
            },
        });
    };

    return <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="mb-4">
            Your account is not provided yet.
        </h1>
        <p className="mb-8">
            This platform is dedicated to Filigran's closest partners for now.
        </p>
        <Button onClick={logout}>
            <LogoutIcon className="h-4 w-4" />  <span className='ml-2'>Logout</span>
        </Button>
    </div>
};

// Component export
export default NotAuthorized;
