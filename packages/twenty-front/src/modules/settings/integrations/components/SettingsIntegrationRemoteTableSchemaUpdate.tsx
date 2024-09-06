import { FetchResult } from '@apollo/client';
import styled from '@emotion/styled';
import { IconReload } from 'twenty-ui';

import { Button } from '@/ui/input/button/components/Button';
import { SyncRemoteTableSchemaChangesMutation } from '~/generated-metadata/graphql';

const StyledText = styled.h3`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin: 0;
`;

type SettingsIntegrationRemoteTableSchemaUpdateProps = {
  updatesText: string;
  onUpdate: () => Promise<FetchResult<SyncRemoteTableSchemaChangesMutation>>;
};

export const SettingsIntegrationRemoteTableSchemaUpdate = ({
  updatesText,
  onUpdate,
}: SettingsIntegrationRemoteTableSchemaUpdateProps) => {
  return (
    <>
      {updatesText && <StyledText>{updatesText}</StyledText>}
      {updatesText && (
        <Button
          Icon={IconReload}
          title="Atualizar"
          size="small"
          onClick={onUpdate}
        />
      )}
    </>
  );
};
