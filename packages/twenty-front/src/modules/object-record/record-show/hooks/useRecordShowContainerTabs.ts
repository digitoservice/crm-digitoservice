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
  IconPrinter,
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
  const isWorkflowRun =
    isWorkflowEnabled &&
    targetObjectNameSingular === CoreObjectNameSingular.WorkflowRun;
  const isWorkflowRelated = isWorkflow || isWorkflowVersion || isWorkflowRun;

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
      hide: isInRightDrawer || isWorkflowRelated,
    },
    {
      id: 'tasks',
      title: 'Tarefas',
      Icon: IconCheckbox,
      hide:
        targetObjectNameSingular === CoreObjectNameSingular.Note ||
        targetObjectNameSingular === CoreObjectNameSingular.Task ||
        isWorkflowRelated,
    },
    {
      id: 'notes',
      title: 'Notas',
      Icon: IconNotes,
      hide:
        targetObjectNameSingular === CoreObjectNameSingular.Note ||
        targetObjectNameSingular === CoreObjectNameSingular.Task ||
        isWorkflowRelated,
    },
    {
      id: 'files',
      title: 'Arquivos',
      Icon: IconPaperclip,
      hide: isWorkflowRelated,
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
      title: 'Fluxo',
      Icon: IconSettings,
      hide: !isWorkflowVersion,
    },
    {
      id: 'workflowRunOutput',
      title: 'Saída',
      Icon: IconPrinter,
      hide: !isWorkflowRun,
    },
    {
      id: 'workflowRunFlow',
      title: 'Fluxo',
      Icon: IconSettings,
      hide: !isWorkflowRun,
    },
  ];
};
