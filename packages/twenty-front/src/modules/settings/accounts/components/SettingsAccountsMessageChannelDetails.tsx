import styled from '@emotion/styled';
import { H2Title, Toggle } from 'twenty-ui';

import {
  MessageChannel,
  MessageChannelContactAutoCreationPolicy,
} from '@/accounts/types/MessageChannel';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SettingsAccountsMessageAutoCreationCard } from '@/settings/accounts/components/SettingsAccountsMessageAutoCreationCard';
import { SettingsAccountsMessageVisibilityCard } from '@/settings/accounts/components/SettingsAccountsMessageVisibilityCard';
import { SettingsOptionCardContent } from '@/settings/components/SettingsOptionCardContent';
import { Card } from '@/ui/layout/card/components/Card';
import { Section } from '@/ui/layout/section/components/Section';
import { MessageChannelVisibility } from '~/generated-metadata/graphql';

type SettingsAccountsMessageChannelDetailsProps = {
  messageChannel: Pick<
    MessageChannel,
    | 'id'
    | 'visibility'
    | 'contactAutoCreationPolicy'
    | 'excludeNonProfessionalEmails'
    | 'excludeGroupEmails'
    | 'isSyncEnabled'
  >;
};

const StyledDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
`;

const StyledToggle = styled(Toggle)`
  margin-left: auto;
`;

export const SettingsAccountsMessageChannelDetails = ({
  messageChannel,
}: SettingsAccountsMessageChannelDetailsProps) => {
  const { updateOneRecord } = useUpdateOneRecord<MessageChannel>({
    objectNameSingular: CoreObjectNameSingular.MessageChannel,
  });

  const handleVisibilityChange = (value: MessageChannelVisibility) => {
    updateOneRecord({
      idToUpdate: messageChannel.id,
      updateOneRecordInput: {
        visibility: value,
      },
    });
  };

  const handleContactAutoCreationChange = (
    value: MessageChannelContactAutoCreationPolicy,
  ) => {
    updateOneRecord({
      idToUpdate: messageChannel.id,
      updateOneRecordInput: {
        contactAutoCreationPolicy: value,
      },
    });
  };

  const handleIsGroupEmailExcludedToggle = (value: boolean) => {
    updateOneRecord({
      idToUpdate: messageChannel.id,
      updateOneRecordInput: {
        excludeGroupEmails: value,
      },
    });
  };

  const handleIsNonProfessionalEmailExcludedToggle = (value: boolean) => {
    updateOneRecord({
      idToUpdate: messageChannel.id,
      updateOneRecordInput: {
        excludeNonProfessionalEmails: value,
      },
    });
  };

  return (
    <StyledDetailsContainer>
      <Section>
        <H2Title
          title="Visibilidade"
          description="Defina o que será visível para outros usuários no seu workspace"
        />
        <SettingsAccountsMessageVisibilityCard
          value={messageChannel.visibility}
          onChange={handleVisibilityChange}
        />
      </Section>
      <Section>
        <H2Title
          title="Criação automática de contatos"
          description="Crie automaticamente registros de Pessoas ao receber ou enviar emails"
        />
        <SettingsAccountsMessageAutoCreationCard
          value={messageChannel.contactAutoCreationPolicy}
          onChange={handleContactAutoCreationChange}
        />
      </Section>
      <Section>
        <Card>
          <SettingsOptionCardContent
            title="Excluir emails não profissionais"
            description="Não criar contatos de/para emails do Gmail, Outlook"
            divider
            onClick={() =>
              handleIsNonProfessionalEmailExcludedToggle(
                !messageChannel.excludeNonProfessionalEmails,
              )
            }
          >
            <StyledToggle value={messageChannel.excludeNonProfessionalEmails} />
          </SettingsOptionCardContent>
          <SettingsOptionCardContent
            title="Excluir emails de grupos"
            description="Não sincronizar emails de team@ support@ noreply@..."
            onClick={() =>
              handleIsGroupEmailExcludedToggle(
                !messageChannel.excludeGroupEmails,
              )
            }
          >
            <StyledToggle value={messageChannel.excludeGroupEmails} />
          </SettingsOptionCardContent>
        </Card>
      </Section>
    </StyledDetailsContainer>
  );
};
