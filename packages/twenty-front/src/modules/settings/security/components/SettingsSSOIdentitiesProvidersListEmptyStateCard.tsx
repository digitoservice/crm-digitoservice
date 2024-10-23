/* @license Enterprise */

import styled from '@emotion/styled';

import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { Button } from '@/ui/input/button/components/Button';
import { Card } from '@/ui/layout/card/components/Card';
import { CardContent } from '@/ui/layout/card/components/CardContent';
import { CardHeader } from '@/ui/layout/card/components/CardHeader';
import { IconKey } from 'twenty-ui';

const StyledHeader = styled(CardHeader)`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(6)};
`;

const StyledBody = styled(CardContent)`
  display: flex;
  justify-content: center;
`;

export const SettingsSSOIdentitiesProvidersListEmptyStateCard = () => {
  return (
    <Card>
      <StyledHeader>{'Nenhum Provedor de Identidade SSO Configurado'}</StyledHeader>
      <StyledBody>
        <Button
          Icon={IconKey}
          title="Adicionar Provedor de Identidade SSO"
          variant="secondary"
          to={getSettingsPagePath(SettingsPath.NewSSOIdentityProvider)}
        />
      </StyledBody>
    </Card>
  );
};
