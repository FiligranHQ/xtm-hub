import React, {FunctionComponent, ReactNode} from 'react';
import { useSearchParams} from 'next/navigation';
import LoginErrorMessage from "@/components/login/login-error-message";


interface LoginTitleProps {
}

const LoginTitleForm: FunctionComponent<LoginTitleProps> = ({}) => {
    const searchParams = useSearchParams()
    const errorKey = searchParams?.get('error');

    return <>
        {errorKey ? <LoginErrorMessage errorKey={errorKey}/> :
            <h1 className="pt-10 txt-title">- Sign in -</h1> }
    </>
}

export default LoginTitleForm;