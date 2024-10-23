import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsOptionCardContent } from '@/settings/components/SettingsOptionCardContent';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Card } from '@/ui/layout/card/components/Card';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';
import { IconLink, Toggle } from 'twenty-ui';
import { useUpdateWorkspaceMutation } from '~/generated/graphql';

const StyledToggle = styled(Toggle)`
  margin-left: auto;
`;

export const SettingsSecurityOptionsList = () => {
  const { enqueueSnackBar } = useSnackBar();

  const [currentWorkspace, setCurrentWorkspace] = useRecoilState(
    currentWorkspaceState,
  );

  const [updateWorkspace] = useUpdateWorkspaceMutation();

  const handleChange = async (value: boolean) => {
    try {
      if (!currentWorkspace?.id) {
        throw new Error('User is not logged in');
      }
      await updateWorkspace({
        variables: {
          input: {
            isPublicInviteLinkEnabled: value,
          },
        },
      });
      setCurrentWorkspace({
        ...currentWorkspace,
        isPublicInviteLinkEnabled: value,
      });
    } catch (err: any) {
      enqueueSnackBar(err?.message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    <Card>
      <SettingsOptionCardContent
        Icon={IconLink}
        title="Convite por Link"
        description="Permitir o convite de novos usuários compartilhando um link de convite."
        onClick={() =>
          handleChange(!currentWorkspace?.isPublicInviteLinkEnabled)
        }
      >
        <StyledToggle value={currentWorkspace?.isPublicInviteLinkEnabled} />
      </SettingsOptionCardContent>
    </Card>
  );
};
