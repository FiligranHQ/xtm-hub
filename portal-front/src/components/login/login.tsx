"use client";

import React, {FormEvent} from "react"
import {graphql, useMutation} from "react-relay";
import {useRouter} from "next/navigation";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from "@mui/material/TextField";

const LoginMutation = graphql`
    mutation loginMutation($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            ...header_fragment
        }
    }
`;

const Login = () => {
    const router = useRouter()
    const [commitLoginMutation] = useMutation(LoginMutation);
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const variables = {
            email: formData.get('email'),
            password: formData.get('password')
        };
        commitLoginMutation({
            variables,
            onCompleted() {
                // If login succeed, refresh the page
                router.refresh();
            }
        })
    }
    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h2">Cloud portal login</Typography>
            <br/>
            <TextField required id="email" name="email" label="Email" variant="outlined"/>
            <br/><br/>
            <TextField required id="password" name="password" label="Password" variant="outlined" type="password"/>
            <br/><br/>
            <Button variant="outlined" type="submit">Login</Button>
        </Box>
    )
}

export default Login;