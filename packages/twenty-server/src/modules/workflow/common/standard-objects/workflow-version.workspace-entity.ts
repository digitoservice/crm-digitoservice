import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceGate } from 'src/engine/twenty-orm/decorators/workspace-gate.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { WORKFLOW_VERSION_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowStep } from 'src/modules/workflow/workflow-executor/types/workflow-action.type';
import { WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export enum WorkflowVersionStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED',
  ARCHIVED = 'ARCHIVED',
}

const WorkflowVersionStatusOptions = [
  {
    value: WorkflowVersionStatus.DRAFT,
    label: 'Rascunho',
    position: 0,
    color: 'yellow',
  },
  {
    value: WorkflowVersionStatus.ACTIVE,
    label: 'Ativo',
    position: 1,
    color: 'green',
  },
  {
    value: WorkflowVersionStatus.DEACTIVATED,
    label: 'Desativado',
    position: 2,
    color: 'red',
  },
  {
    value: WorkflowVersionStatus.ARCHIVED,
    label: 'Arquivado',
    position: 3,
    color: 'grey',
  },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.workflowVersion,
  namePlural: 'workflowVersions',
  labelSingular: 'Versão do Workflow',
  labelPlural: 'Versões do Workflow',
  description: 'Uma versão do workflow',
  icon: 'IconSettingsAutomation',
  labelIdentifierStandardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.name,
})
@WorkspaceGate({
  featureFlag: FeatureFlagKey.IsWorkflowEnabled,
})
export class WorkflowVersionWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Nome',
    description: 'O nome da versão do workflow',
    icon: 'IconSettingsAutomation',
  })
  name: string;

  @WorkspaceField({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.trigger,
    type: FieldMetadataType.RAW_JSON,
    label: 'Gatilho da Versão',
    description: 'Objeto JSON para definir o gatilho',
    icon: 'IconSettingsAutomation',
  })
  @WorkspaceIsNullable()
  trigger: WorkflowTrigger | null;

  @WorkspaceField({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.steps,
    type: FieldMetadataType.RAW_JSON,
    label: 'Etapas da Versão',
    description: 'Objeto JSON para definir as etapas',
    icon: 'IconSettingsAutomation',
  })
  @WorkspaceIsNullable()
  steps: WorkflowStep[] | null;

  @WorkspaceField({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: 'Status da Versão',
    description: 'O status da versão do workflow',
    icon: 'IconStatusChange',
    options: WorkflowVersionStatusOptions,
    defaultValue: "'DRAFT'",
  })
  status: WorkflowVersionStatus;

  @WorkspaceField({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: 'Posição',
    description: 'Posição da versão do workflow',
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  position: number | null;

  // Relations
  @WorkspaceRelation({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.workflow,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Workflow',
    description: 'Workflow da versão do workflow',
    icon: 'IconSettingsAutomation',
    inverseSideTarget: () => WorkflowWorkspaceEntity,
    inverseSideFieldKey: 'versions',
  })
  @WorkspaceIsNullable()
  workflow: Relation<WorkflowWorkspaceEntity>;

  @WorkspaceJoinColumn('workflow')
  workflowId: string;

  @WorkspaceRelation({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.runs,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Execuções',
    description: 'Execuções do workflow vinculadas à versão.',
    icon: 'IconRun',
    inverseSideTarget: () => WorkflowRunWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  runs: Relation<WorkflowRunWorkspaceEntity>;

  @WorkspaceRelation({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.favorites,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Favoritos',
    description: 'Favoritos vinculados à versão do workflow',
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKFLOW_VERSION_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Atividades da Linha do Tempo',
    description: 'Atividades da linha do tempo vinculadas à versão',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;
}
