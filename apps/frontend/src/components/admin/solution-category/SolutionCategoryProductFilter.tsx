import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@filigran/ui';
import { FiligranProduct } from '@graphql/generated';
import { useTranslations } from 'next-intl';

const SolutionCategoryProductFilter = ({
  selectedProduct,
  onProductChange,
}: {
  selectedProduct?: FiligranProduct;
  onProductChange: (product?: FiligranProduct) => void;
}) => {
  const t = useTranslations();

  return (
    <Select
      value={selectedProduct ?? 'all'}
      onValueChange={(value) =>
        onProductChange(
          value === 'all' ? undefined : (value as FiligranProduct)
        )
      }>
      <SelectTrigger className="w-full sm:w-45">
        <SelectValue placeholder={t('SolutionCategoryListPage.Product')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          {t('SolutionCategoryListPage.AllProducts')}
        </SelectItem>
        {Object.values(FiligranProduct).map((product) => (
          <SelectItem
            key={product}
            value={product}>
            {product.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SolutionCategoryProductFilter;
