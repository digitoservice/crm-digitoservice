import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  IconCalendarEvent,
  IconCheckbox,
  IconList,
  IconMail,
  IconNotes,
  IconPaperclip,
  IconSettings,
  IconTimelineEvent,
} from 'twenty-ui';

export const useRecordShowContainerTabs = (
  loading: boolean,
  targetObjectNameSingular: CoreObjectNameSingular,
  isInRightDrawer: boolean,
) => {
  const isMobile = useIsMobile();
  const isWorkflowEnabled = useIsFeatureEnabled('IS_WORKFLOW_ENABLED');

  const isWorkflow =
    isWorkflowEnabled &&
    targetObjectNameSingular === CoreObjectNameSingular.Workflow;
  const isWorkflowVersion =
    isWorkflowEnabled &&
    targetObjectNameSingular === CoreObjectNameSingular.WorkflowVersion;

  const isCompanyOrPerson = [
    CoreObjectNameSingular.Company,
    CoreObjectNameSingular.Person,
  ].includes(targetObjectNameSingular);
  const shouldDisplayCalendarTab = isCompanyOrPerson;
  const shouldDisplayEmailsTab = isCompanyOrPerson;

  return [
    {
      id: 'richText',
      title: 'Nota',
      Icon: IconNotes,
      hide:
        loading ||
        (targetObjectNameSingular !== CoreObjectNameSingular.Note &&
          targetObjectNameSingular !== CoreObjectNameSingular.Task),
    },
    {
      id: 'fields',
      title: 'Campos',
      Icon: IconList,
      hide: !(isMobile || isInRightDrawer),
    },
    {
      id: 'timeline',
      title: 'Linha do Tempo',
      Icon: IconTimelineEvent,
      hide: isInRightDrawer || isWorkflow || isWorkflowVersion,
    },
    {
      id: 'tasks',
      title: 'Tarefas',
      Icon: IconCheckbox,
      hide:
        targetObjectNameSingular === CoreObjectNameSingular.Note ||
        targetObjectNameSingular === CoreObjectNameSingular.Task ||
        isWorkflow ||
        isWorkflowVersion,
    },
    {
      id: 'notes',
      title: 'Notas',
      Icon: IconNotes,
      hide:
        targetObjectNameSingular === CoreObjectNameSingular.Note ||
        targetObjectNameSingular === CoreObjectNameSingular.Task ||
        isWorkflow ||
        isWorkflowVersion,
    },
    {
      id: 'files',
      title: 'Arquivos',
      Icon: IconPaperclip,
      hide: isWorkflow || isWorkflowVersion,
    },
    {
      id: 'emails',
      title: 'Emails',
      Icon: IconMail,
      hide: !shouldDisplayEmailsTab,
    },
    {
      id: 'calendar',
      title: 'Calendário',
      Icon: IconCalendarEvent,
      hide: !shouldDisplayCalendarTab,
    },
    {
      id: 'workflow',
      title: 'Workflow',
      Icon: IconSettings,
      hide: !isWorkflow,
    },
    {
      id: 'workflowVersion',
      title: 'Versão do Workflow',
      Icon: IconSettings,
      hide: !isWorkflowVersion,
    },
  ];
};
