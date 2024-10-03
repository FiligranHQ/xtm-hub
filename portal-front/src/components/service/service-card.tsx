import * as React from "react";
import {useTranslations} from "next-intl";
import {ServiceTypeBadge} from "@/components/ui/service-type-badge";
import {ReactNode} from "react";
import {serviceList_fragment$data} from "../../../__generated__/serviceList_fragment.graphql";

interface ServiceCardProps {
    service: serviceList_fragment$data;
    topRightAction: ReactNode | null;
    bottomLeftAction: ReactNode;
}
const ServiceCard: React.FunctionComponent<ServiceCardProps> = ({
    service,
    topRightAction,
    bottomLeftAction
   }) => {
    const t = useTranslations();

    console.log("bottomLeftAction", bottomLeftAction)
    return (<li
        className="border-light flex flex-col rounded border bg-page-background p-s"
        key={service.id}>
        <div className="flex-1 pt-l pl-l flex justify-between items-center gap-s">
            <h3>{service.name}</h3>{' '}

            {topRightAction}

        </div>
        <p className={'pt-l pl-l txt-sub-content'}>
            {service.description}
        </p>
        <div className="flex justify-between items-center p-l gap-s flex-row">
            <div>
                <ServiceTypeBadge
                    type={service.type as ServiceTypeBadge}
                />
            </div>
            <div>
            {bottomLeftAction}
            </div>

        </div>
    </li>)
}
export default ServiceCard;
