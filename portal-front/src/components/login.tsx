"use client";

import React, {FormEvent} from "react"
import {graphql, useMutation} from "react-relay";
import {useRouter} from "next/navigation";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import TextField from "@mui/material/TextField";
import Image from 'next/image'
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';

// Relay
const LoginMutation = graphql`
    mutation loginMutation($email: String!, $password: String!) {
        login(email: $email, password: $password) {
            ...context_fragment
        }
    }
`;

// Component interface
interface LoginProps {
}

// Component
const Login: React.FunctionComponent<LoginProps> = () => {
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
        <>
            <Container component="main" maxWidth="xs">
                <CssBaseline/>
                <Box sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                    <Image
                        src="/filigran_scred.svg"
                        width={500}
                        height={500}
                        alt="Scred logo"
                    />
                    <Typography style={{marginTop: 40}} component="h1" variant="h5">
                        - Sign in -
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 1}}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                        />
                        <Button type="submit"
                                fullWidth
                                variant="contained"
                                sx={{mt: 3, mb: 2}}>
                            Sign In
                        </Button>
                    </Box>
                </Box>
            </Container>
        </>
    )
}

// Component export
export default Login;