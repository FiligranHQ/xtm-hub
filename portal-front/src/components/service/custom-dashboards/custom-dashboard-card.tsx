import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';

interface CustomDashbordCardProps {
  customDashboard: documentItem_fragment$data;
}

const CustomDashbordCard = ({ customDashboard }: CustomDashbordCardProps) => {
  return (
    <li
      className="border-light flex flex-col relative rounded border bg-page-background p-l gap-l aria-disabled:opacity-60"
      aria-disabled={!customDashboard.active}>
      <div className="flex items-center">
        <h3>{customDashboard.name}</h3>
      </div>
      <p className="flex-1 txt-sub-content">{customDashboard.description}</p>
    </li>
  );
};

export default CustomDashbordCard;
