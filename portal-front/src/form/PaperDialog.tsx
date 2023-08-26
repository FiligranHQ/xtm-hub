import * as React from "react";
import styled from "@mui/system/styled";
import Dialog from "@mui/material/Dialog";

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

interface PaperDialogProps {
    handleClose: () => void
    children?: React.ReactNode
}

const PaperDialog: React.FunctionComponent<PaperDialogProps> = ({handleClose, children}) => {
    return <StyledDialog open={true} PaperProps={PaperDialogStyle}
                         onClose={handleClose} scroll={'paper'}
                         maxWidth={'lg'}>
        {children}
    </StyledDialog>
}

export default PaperDialog;