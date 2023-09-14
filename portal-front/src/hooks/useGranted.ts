import {useContext} from "react";
import {Portal, portalContext} from "../../app/context";

const useGranted = (capability: string) => {
    const { hasCapability } = useContext<Portal>(portalContext);
    return hasCapability && hasCapability(capability);
}

export default useGranted;