import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import styled from "@mui/system/styled";
import {Controller, useForm} from "react-hook-form";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import * as Yup from "yup";
import {graphql, useMutation} from "react-relay";
import {yupResolver} from "@hookform/resolvers/yup";
import {OrganizationsSelect} from "@/form/OrganizationsSelect";
import {userCreateMutation} from "../../../__generated__/userCreateMutation.graphql";

const StyledDialog = styled(Dialog)(() => ({
    "& .MuiDialog-container": {
        alignItems: "flex-start",
        justifyContent: 'right',

    }
}));
const PaperDialogStyle = {
    sx: {
        margin: '0px 0px 0px 0px',
        minWidth: 920,
        maxHeight: '100%',
        height: '100%'
    }
};

const UserCreateMutation = graphql`
    mutation userCreateMutation($email: String!, $password: String!, $organization_id: String! $connections: [ID!]!) {
        addUser(email: $email, password: $password, organization_id: $organization_id) @prependNode(connections: $connections, edgeTypeName: "UsersEdge") {
            email
        }
    }
`;

interface FormData {
    email: string
    first_name?: string
    last_name?: string
    password: string
    organization_id: string
}

interface UserCreateProps {
    connectionID: string
    handleClose: () => void
}

const UserCreate: React.FunctionComponent<UserCreateProps> = ({connectionID, handleClose}) => {
    const schema = Yup.object().shape({
        email: Yup.string().email().ensure().required("Field is required"),
        first_name: Yup.string(),
        last_name: Yup.string(),
        password: Yup.string().ensure().required("Field is required"),
        organization_id: Yup.string().ensure().required("Field is required"),
    });
    const {handleSubmit, control} = useForm<FormData>({
        resolver: yupResolver(schema),
    });
    const [commitUserMutation] = useMutation<userCreateMutation>(UserCreateMutation);
    const onSubmit = (variables: FormData) => {
        commitUserMutation({variables: {connections: [connectionID], ...variables}, onCompleted: () => handleClose()})
    };
    return <StyledDialog open={true} PaperProps={PaperDialogStyle}
                         onClose={handleClose} scroll={'paper'}
                         maxWidth={'lg'}>
        <DialogTitle>Create a new user</DialogTitle>
        <hr/>
        <DialogContent>
            <DialogContentText>
                <Box component="form" noValidate>
                    <Controller control={control} name="email" render={({field, fieldState: {error}}) => (
                        <TextField margin="normal" {...field} type="email" fullWidth label="Email" error={!!error}
                                   helperText={error?.message}/>
                    )}/>
                    <Controller control={control} name="first_name" render={({field, fieldState: {error}}) => (
                        <TextField margin="normal" {...field} type="text" fullWidth label="First name" error={!!error}
                                   helperText={error?.message}/>
                    )}/>
                    <Controller control={control} name="last_name" render={({field, fieldState: {error}}) => (
                        <TextField margin="normal" {...field} type="text" fullWidth label="Last name" error={!!error}
                                   helperText={error?.message}/>
                    )}/>
                    <Controller control={control} name="password" render={({field, fieldState: {error}}) => (
                        <TextField margin="normal" {...field} type="password" fullWidth label="Password" error={!!error}
                                   helperText={error?.message}/>
                    )}/>
                    <OrganizationsSelect name="organization_id" control={control} label={"User organization"}/>
                </Box>
            </DialogContentText>
        </DialogContent>
        <DialogActions sx={{mr: 2}}>
            <Button variant="outlined" sx={{mt: 3, mb: 2}} onClick={handleClose}>Cancel</Button>
            <Button variant="contained" sx={{mt: 3, mb: 2}} onClick={handleSubmit(onSubmit)}>Create a user</Button>
        </DialogActions>
    </StyledDialog>
}

export default UserCreate;