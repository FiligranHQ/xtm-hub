import React, {FunctionComponent, ReactNode} from "react";

interface ErrorMessageProps {
    errorKey: string;
}

const LoginErrorMessage: FunctionComponent<ErrorMessageProps> = ({ errorKey }) => {
    const errorMap: Record<string, ReactNode> = {
        'not-provided': (
            <>
                <h1 className="pt-10 txt-title text-center text-red">Your account has not been provided!</h1>
                <p className="txt-subtitle text-center text-red">
                    This platform is dedicated to Filigran&rsquo;s closest partners for now.
                </p>
            </>
        ),
    };
    return (
        <>
            {errorMap[errorKey]}
        </>
    );
};

export default LoginErrorMessage;