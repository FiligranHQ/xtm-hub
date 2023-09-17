import * as React from 'react';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {useForm} from "react-hook-form";
import Box from "@mui/material/Box";
import * as Yup from "yup";
import {graphql, useMutation} from "react-relay";
import {yupResolver} from "@hookform/resolvers/yup";
import {OrganizationsSelect} from "@/form/OrganizationsSelect";
import {AddUserInput, userCreateMutation} from "../../../__generated__/userCreateMutation.graphql";
import PaperDialog from "@/form/PaperDialog";
import ControlledTextField from "@/form/ControlledTextField";

const UserCreateMutation = graphql`
    mutation userCreateMutation($input: AddUserInput!, $connections: [ID!]!) {
        addUser(input: $input) @prependNode(connections: $connections, edgeTypeName: "UsersEdge") {
            email
        }
    }
`;

interface FormData {
    email: string
    first_name?: string | null
    last_name?: string | null
    password: string
    organization: { id: string, name?: string | null }
}

interface UserCreateProps {
    connectionID: string
    handleClose: () => void
}

const UserCreate: React.FunctionComponent<UserCreateProps> = ({connectionID, handleClose}) => {
    const schema = Yup.object().shape({
        email: Yup.string().email().ensure().required("Field is required"),
        first_name: Yup.string().nullable(),
        last_name: Yup.string().nullable(),
        password: Yup.string().ensure().required("Field is required"),
        organization: Yup.object().shape({
            id: Yup.string().ensure().required("Field is required"),
            name: Yup.string().nullable(),
        }).required("Field is required"),
    });
    const {handleSubmit, control} = useForm<FormData>({
        resolver: yupResolver(schema),
    });
    const [commitUserMutation] = useMutation<userCreateMutation>(UserCreateMutation);
    const onSubmit = (variables: FormData) => {
        const input: AddUserInput = {
            email: variables.email,
            password: variables.password,
            organization_id: variables.organization.id
        }
        commitUserMutation({
            variables: {input, connections: [connectionID]}, onCompleted: () => handleClose()
        })
    };
    return <PaperDialog handleClose={handleClose}>
        <DialogTitle>Create a new user</DialogTitle>
        <hr/>
        <DialogContent>
            <DialogContentText>
                <Box component="form" noValidate>
                    <ControlledTextField<FormData, "email">
                        name="email" label="Email" type="Email" control={control}/>
                    <ControlledTextField<FormData, "first_name">
                        name="first_name" label="First name" control={control}/>
                    <ControlledTextField<FormData, "last_name">
                        name="last_name" label="Last name" control={control}/>
                    <ControlledTextField<FormData, "password">
                        name="password" label="Password" type="password" control={control}/>
                    <OrganizationsSelect
                        name="organization" control={control} label={"User organization"}/>
                </Box>
            </DialogContentText>
        </DialogContent>
        <DialogActions sx={{mr: 2}}>
            <Button variant="outlined" sx={{mt: 3, mb: 2}} onClick={handleClose}>Cancel</Button>
            <Button variant="contained" sx={{mt: 3, mb: 2}} onClick={handleSubmit(onSubmit)}>Create a user</Button>
        </DialogActions>
    </PaperDialog>
}

export default UserCreate;