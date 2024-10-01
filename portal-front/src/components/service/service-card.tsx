import * as React from "react";
import {useTranslations} from "next-intl";
import {ServiceTypeBadge} from "@/components/ui/service-type-badge";
import {ReactNode} from "react";
import {serviceList_fragment$data} from "../../../__generated__/serviceList_fragment.graphql";

interface ServiceCardProps {
    service: serviceList_fragment$data;
    action: ReactNode;
}
const ServiceCard: React.FunctionComponent<ServiceCardProps> = ({
    service,
    action
   }) => {
    const t = useTranslations();

    return (<li
        className="border-light flex flex-col rounded border bg-page-background p-s"
        key={service.id}>
        <div className="flex-1 p-m pb-xl flex justify-between items-center gap-s">
            <h3>{service.name}</h3>{' '}

            {action}

        </div>
        <p className={'p-m pb-xl pt-s txt-sub-content'}>
            {service.description}
        </p>
        <ul className="flex justify-between items-center p-s gap-s flex-row">
            <li>
                <ServiceTypeBadge
                    type={service.type as ServiceTypeBadge}
                />
            </li>

        </ul>
    </li>)
}
export default ServiceCard;
