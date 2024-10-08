import styled from '@emotion/styled';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

import { Logo } from '@/auth/components/Logo';
import { Title } from '@/auth/components/Title';
import { FooterNote } from '@/auth/sign-in-up/components/FooterNote';
import { SignInUpForm } from '@/auth/sign-in-up/components/SignInUpForm';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { useWorkspaceFromInviteHash } from '@/auth/sign-in-up/hooks/useWorkspaceFromInviteHash';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { Loader } from '@/ui/feedback/loader/components/Loader';
import { MainButton } from '@/ui/input/button/components/MainButton';
import { useWorkspaceSwitching } from '@/ui/navigation/navigation-drawer/hooks/useWorkspaceSwitching';
import { AnimatedEaseIn } from '@/ui/utilities/animation/components/AnimatedEaseIn';
import {
  useAddUserToWorkspaceMutation,
  useAddUserToWorkspaceByInviteTokenMutation,
} from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';
import { useSearchParams } from 'react-router-dom';

const StyledContentContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(8)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

export const Invite = () => {
  const { workspace: workspaceFromInviteHash, workspaceInviteHash } =
    useWorkspaceFromInviteHash();

  const { form } = useSignInUpForm();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const [addUserToWorkspace] = useAddUserToWorkspaceMutation();
  const [addUserToWorkspaceByInviteToken] =
    useAddUserToWorkspaceByInviteTokenMutation();
  const { switchWorkspace } = useWorkspaceSwitching();
  const [searchParams] = useSearchParams();
  const workspaceInviteToken = searchParams.get('inviteToken');

  const title = useMemo(() => {
    return `Junte-se à equipe ${workspaceFromInviteHash?.displayName ?? ''}`;
  }, [workspaceFromInviteHash?.displayName]);

  const handleUserJoinWorkspace = async () => {
    if (isDefined(workspaceInviteToken) && isDefined(workspaceFromInviteHash)) {
      await addUserToWorkspaceByInviteToken({
        variables: {
          inviteToken: workspaceInviteToken,
        },
      });
    } else if (
      isDefined(workspaceInviteHash) &&
      isDefined(workspaceFromInviteHash)
    ) {
      await addUserToWorkspace({
        variables: {
          inviteHash: workspaceInviteHash,
        },
      });
    } else {
      return;
    }

    await switchWorkspace(workspaceFromInviteHash.id);
  };

  if (
    !isDefined(workspaceFromInviteHash) ||
    (isDefined(workspaceFromInviteHash) &&
      isDefined(currentWorkspace) &&
      workspaceFromInviteHash.id === currentWorkspace.id)
  ) {
    return <></>;
  }

  return (
    <>
      <AnimatedEaseIn>
        <Logo workspaceLogo={workspaceFromInviteHash?.logo} />
      </AnimatedEaseIn>
      <Title animate>{title}</Title>
      {isDefined(currentWorkspace) ? (
        <>
          <StyledContentContainer>
            <MainButton
              title="Continuar"
              type="submit"
              onClick={handleUserJoinWorkspace}
              Icon={() => form.formState.isSubmitting && <Loader />}
              fullWidth
            />
          </StyledContentContainer>
          <FooterNote>
            Ao usar os serviços da Digito Service, você concorda com os{' '}
            <a
              href="https://c.digitoservice.com/legal/terms"
              target="_blank"
              rel="noopener noreferrer"
            >
              Termos de Serviço
            </a>{' '}
            e{' '}
            <a
              href="https://c.digitoservice.com/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Política de Privacidade
            </a>
            .
          </FooterNote>
        </>
      ) : (
        <SignInUpForm />
      )}
    </>
  );
};
