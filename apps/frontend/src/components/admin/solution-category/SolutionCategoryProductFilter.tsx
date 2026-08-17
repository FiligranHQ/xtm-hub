import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@filigran/ui';
import { FiligranProduct } from '@graphql/generated';
import { useTranslate } from '@tolgee/react';
const SolutionCategoryProductFilter = ({
  selectedProduct,
  onProductChange,
}: {
  selectedProduct?: FiligranProduct;
  onProductChange: (product?: FiligranProduct) => void;
}) => {
  const { t } = useTranslate();

  return (
    <Select
      value={selectedProduct ?? 'all'}
      onValueChange={(value) =>
        onProductChange(
          value === 'all' ? undefined : (value as FiligranProduct)
        )
      }>
      <SelectTrigger className="w-full sm:w-45">
        <SelectValue placeholder={t('SolutionCategory_ListPage_Product')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          {t('SolutionCategory_ListPage_AllProducts')}
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
