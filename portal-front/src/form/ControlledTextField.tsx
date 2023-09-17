import {Control, Controller, FieldValues} from "react-hook-form";
import TextField from "@mui/material/TextField";
import * as React from "react";
import {FieldPath} from "react-hook-form";

interface ControlledTextFieldProps<T extends FieldValues, U extends FieldPath<T>> {
    name: U
    label: string
    type?: string
    control: Control<T>
}

const ControlledTextField = <T extends FieldValues, U extends FieldPath<T>>
({name, label, type, control}: ControlledTextFieldProps<T, U>) => {
    return <Controller control={control} name={name} render={({field, fieldState: {error}}) => (
        <TextField margin="normal" {...field} type={type ?? 'text'} fullWidth label={label} error={!!error}
                   helperText={error?.message}/>
    )}/>
}

export default ControlledTextField;