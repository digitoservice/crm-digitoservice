import { CalendarChannel } from '@/accounts/types/CalendarChannel';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SettingsAccountsEventVisibilitySettingsCard } from '@/settings/accounts/components/SettingsAccountsCalendarVisibilitySettingsCard';
import { SettingsOptionCardContent } from '@/settings/components/SettingsOptionCardContent';
import { Card } from '@/ui/layout/card/components/Card';
import styled from '@emotion/styled';
import { Section } from '@react-email/components';
import { H2Title, Toggle } from 'twenty-ui';
import { CalendarChannelVisibility } from '~/generated-metadata/graphql';

const StyledDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
`;

type SettingsAccountsCalendarChannelDetailsProps = {
  calendarChannel: Pick<
    CalendarChannel,
    'id' | 'visibility' | 'isContactAutoCreationEnabled' | 'isSyncEnabled'
  >;
};

const StyledToggle = styled(Toggle)`
  margin-left: auto;
`;

export const SettingsAccountsCalendarChannelDetails = ({
  calendarChannel,
}: SettingsAccountsCalendarChannelDetailsProps) => {
  const { updateOneRecord } = useUpdateOneRecord<CalendarChannel>({
    objectNameSingular: CoreObjectNameSingular.CalendarChannel,
  });

  const handleVisibilityChange = (value: CalendarChannelVisibility) => {
    updateOneRecord({
      idToUpdate: calendarChannel.id,
      updateOneRecordInput: {
        visibility: value,
      },
    });
  };

  const handleContactAutoCreationToggle = (value: boolean) => {
    updateOneRecord({
      idToUpdate: calendarChannel.id,
      updateOneRecordInput: {
        isContactAutoCreationEnabled: value,
      },
    });
  };

  return (
    <StyledDetailsContainer>
      <Section>
        <H2Title
          title="Visibilidade de eventos"
          description="Defina o que será visível para outros usuários no seu workspace"
        />
        <SettingsAccountsEventVisibilitySettingsCard
          value={calendarChannel.visibility}
          onChange={handleVisibilityChange}
        />
      </Section>
      <Section>
        <H2Title
          title="Criação automática de contatos"
          description="Crie automaticamente contatos para as pessoas com quem você participou de um evento."
        />
        <Card>
          <SettingsOptionCardContent
            title="Criação automática"
            description="Crie automaticamente contatos para as pessoas."
            onClick={() =>
              handleContactAutoCreationToggle(
                !calendarChannel.isContactAutoCreationEnabled,
              )
            }
          >
            <StyledToggle
              value={calendarChannel.isContactAutoCreationEnabled}
            />
          </SettingsOptionCardContent>
        </Card>
      </Section>
    </StyledDetailsContainer>
  );
};
