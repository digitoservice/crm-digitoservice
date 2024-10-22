import { VariableDateViewFilterValueUnit } from '@/views/view-filter-value/utils/resolveDateViewFilterValue';

type RelativeDateUnit = {
  value: VariableDateViewFilterValueUnit;
  label: string;
};

export const RELATIVE_DATE_UNITS_SELECT_OPTIONS: RelativeDateUnit[] = [
  { value: 'DAY', label: 'Dia' },
  { value: 'WEEK', label: 'Semana' },
  { value: 'MONTH', label: 'Mês' },
  { value: 'YEAR', label: 'Ano' },
];
