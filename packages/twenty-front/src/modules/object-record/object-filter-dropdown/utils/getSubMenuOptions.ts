import { FilterableFieldType } from '@/object-record/object-filter-dropdown/types/FilterableFieldType';

export const getSubMenuOptions = (subMenu: FilterableFieldType | null) => {
  switch (subMenu) {
    case 'ACTOR':
      return [
        {
          name: 'Fonte de Criação',
          icon: 'IconPlug',
          type: 'SOURCE',
        },
        {
          name: 'Nome do Criador',
          icon: 'IconId',
          type: 'ACTOR',
        },
      ];
    default:
      return [];
  }
};
