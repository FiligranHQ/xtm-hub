import {Control, Controller} from "react-hook-form";
import * as React from "react";
import {useEffect} from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import {GraphQLTaggedNode} from "relay-runtime/lib/query/RelayModernGraphQLTag";
import {PreloadedQuery, usePreloadedQuery, useQueryLoader} from "react-relay";
import {OperationType} from "relay-runtime";

interface ComponentAutoCompleteProps {
    name: string
    label: string
    open: boolean
    loading: boolean
    setOpen: (open: boolean) => void
    choices: { id: string, name: string }[]
    control: Control
}

const ComponentAutoComplete: React.FunctionComponent<ComponentAutoCompleteProps>
    = ({name, label, loading, open, setOpen, choices, control}) => {
    return <Controller
        control={control} name={name} render={({field, fieldState: {error}}) => {
        const {onChange, onBlur, value} = field;
        return (
            <Autocomplete
                open={open}
                sx={{mt: '16px', mb: '8px'}}
                onOpen={() => setOpen(true)}
                onClose={() => setOpen(false)}
                loading={loading}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                getOptionLabel={(option) => option.name}
                options={choices}
                onChange={(_, selection) => onChange(selection)}
                onBlur={onBlur}
                value={value}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        {...field}
                        error={!!error}
                        helperText={error?.message}
                        label={label}
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <React.Fragment>
                                    {loading ? <CircularProgress color="inherit" size={20}/> : null}
                                    {params.InputProps.endAdornment}
                                </React.Fragment>
                            ),
                        }}
                    />
                )}
            />)
    }}/>
}

interface ComponentAutoCompleteLoaderProps<T> {
    name: string,
    label: string,
    query: GraphQLTaggedNode,
    queryReference: PreloadedQuery<any>
    transformer: (data: T) => { id: string, name: string }[]
    control: Control
}

const ComponentAutoCompleteLoader = <T, >(props: ComponentAutoCompleteLoaderProps<T>) => {
    const {query, transformer, name, label, queryReference, control} = props;
    const [open, setOpen] = React.useState(true);
    const data = usePreloadedQuery(query, queryReference);
    const choices = transformer(data);
    return <ComponentAutoComplete name={name} control={control} loading={false} label={label}
                                  open={open} setOpen={setOpen} choices={choices}/>
}

interface AutoCompleteSelectProps<U> {
    name: string,
    label: string,
    query: GraphQLTaggedNode,
    transformer: (data: U) => { id: string, name: string }[]
    control: Control
}

export const AutoCompleteSelect = <T extends OperationType, U>(props: AutoCompleteSelectProps<U>) => {
    const {query, transformer, name, label, control} = props;
    const [open, setOpen] = React.useState(false);
    const [queryReference, loadQuery] = useQueryLoader<T>(query);
    useEffect(() => {
        if (open) loadQuery({}, {fetchPolicy: 'network-only'})
    }, [loadQuery, open]);
    if (queryReference == null) {
        return <ComponentAutoComplete name={name} control={control} label={label} loading={open}
                                      open={open} setOpen={setOpen} choices={[]}/>
    }
    return <ComponentAutoCompleteLoader<U>
        name={name} label={label}
        query={query} control={control}
        transformer={transformer}
        queryReference={queryReference}/>
}