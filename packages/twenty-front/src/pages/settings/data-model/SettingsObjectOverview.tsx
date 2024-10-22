import { ReactFlowProvider } from 'reactflow';

import { SettingsDataModelOverview } from '@/settings/data-model/graph-overview/components/SettingsDataModelOverview';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';

export const SettingsObjectOverview = () => {
  return (
    <SubMenuTopBarContainer
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        { children: 'Objetos', href: '/settings/objects' },
        {
          children: 'Visão Geral',
        },
      ]}
    >
      <ReactFlowProvider>
        <SettingsDataModelOverview />
      </ReactFlowProvider>
    </SubMenuTopBarContainer>
  );
};
