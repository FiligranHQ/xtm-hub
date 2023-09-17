import * as React from "react";
import PaperDialog from "@/form/PaperDialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Box from "@mui/material/Box";
import {useForm} from "react-hook-form";
import {OrganizationsSelect} from "@/form/OrganizationsSelect";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import {userSlug_fragment$data} from "../../../../__generated__/userSlug_fragment.graphql";
import * as Yup from "yup";
import {yupResolver} from "@hookform/resolvers/yup";
import ControlledTextField from "@/form/ControlledTextField";
import {graphql, useMutation} from "react-relay";
import {EditUserInput, userEditMutation} from "../../../../__generated__/userEditMutation.graphql";

const UserEditMutation = graphql`
    mutation userEditMutation($id: ID!, $input: EditUserInput!) {
        editUser(id: $id, input: $input) {
            ...userSlug_fragment
        }
    }
`;

interface FormData {
    email: string
    first_name?: string | null
    last_name?: string | null
    organization: { id: string, name?: string | null }
}

interface UserEditProps {
    user: userSlug_fragment$data
    handleClose: () => void
}

const UserSlugEdit: React.FunctionComponent<UserEditProps> = ({user, handleClose}) => {
    const [commitUserMutation] = useMutation<userEditMutation>(UserEditMutation);
    const schema = Yup.object().shape({
        email: Yup.string().email().ensure().required("Field is required"),
        first_name: Yup.string().nullable(),
        last_name: Yup.string().nullable(),
        organization: Yup.object().shape({
            id: Yup.string().ensure().required("Field is required"),
            name: Yup.string().nullable(),
        }).required("Field is required"),
    });
    const defaultValues: FormData = {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        organization: user.organization
    }
    const {handleSubmit, control, formState: {isDirty}} = useForm<FormData>({
        defaultValues,
        resolver: yupResolver(schema),
    });
    const onSubmit = (variables: FormData) => {
        const input: EditUserInput = {
            email: variables.email,
            first_name: variables.first_name,
            last_name: variables.last_name,
            organization_id: variables.organization.id
        }
        commitUserMutation({
            variables: {id: user.id, input}, onCompleted: () => handleClose()
        })
    };
    return <PaperDialog handleClose={handleClose}>
        <DialogTitle>Edit user</DialogTitle>
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
                    <OrganizationsSelect
                        name="organization" control={control} label={"User organization"}/>
                </Box>
            </DialogContentText>
        </DialogContent>
        <DialogActions sx={{mr: 2}}>
            <Button variant="outlined" sx={{mt: 3, mb: 2}} onClick={handleClose}>Cancel</Button>
            <Button disabled={!isDirty} variant="contained" sx={{mt: 3, mb: 2}} onClick={handleSubmit(onSubmit)}>Save</Button>
        </DialogActions>
    </PaperDialog>
}

export default UserSlugEdit;