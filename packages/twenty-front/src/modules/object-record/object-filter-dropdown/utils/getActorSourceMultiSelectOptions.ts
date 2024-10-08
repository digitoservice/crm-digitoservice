import { SelectableItem } from '@/object-record/select/types/SelectableItem';
import {
  IconApi,
  IconCsv,
  IconGmail,
  IconGoogleCalendar,
  IconRobot,
  IconSettingsAutomation,
  IconUserCircle,
} from 'twenty-ui';

export const getActorSourceMultiSelectOptions = (
  selectedSourceNames: string[],
): SelectableItem[] => {
  return [
    {
      id: 'MANUAL',
      name: 'Usuário',
      isSelected: selectedSourceNames.includes('MANUAL'),
      AvatarIcon: IconUserCircle,
      isIconInverted: true,
    },
    {
      id: 'IMPORT',
      name: 'Importação',
      isSelected: selectedSourceNames.includes('IMPORT'),
      AvatarIcon: IconCsv,
      isIconInverted: true,
    },
    {
      id: 'API',
      name: 'Api',
      isSelected: selectedSourceNames.includes('API'),
      AvatarIcon: IconApi,
      isIconInverted: true,
    },
    {
      id: 'EMAIL',
      name: 'Email',
      isSelected: selectedSourceNames.includes('EMAIL'),
      AvatarIcon: IconGmail,
    },
    {
      id: 'CALENDAR',
      name: 'Calendário',
      isSelected: selectedSourceNames.includes('CALENDAR'),
      AvatarIcon: IconGoogleCalendar,
    },
    {
      id: 'WORKFLOW',
      name: 'Workflow',
      isSelected: selectedSourceNames.includes('WORKFLOW'),
      AvatarIcon: IconSettingsAutomation,
      isIconInverted: true,
    },
    {
      id: 'SYSTEM',
      name: 'Sistema',
      isSelected: selectedSourceNames.includes('SYSTEM'),
      AvatarIcon: IconRobot,
      isIconInverted: true,
    },
  ];
};
