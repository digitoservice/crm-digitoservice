import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceGate } from 'src/engine/twenty-orm/decorators/workspace-gate.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { MESSAGE_THREAD_SUBSCRIBER_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.messageThreadSubscriber,
  namePlural: 'messageThreadSubscriber',
  labelSingular: 'Assinante de Discussão de Mensagem',
  labelPlural: 'Assinantes de Discussão de Mensagem',
  description: 'Assinantes de Discussão de Mensagem',
  icon: 'IconPerson',
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
@WorkspaceGate({
  featureFlag: FeatureFlagKey.IsMessageThreadSubscriberEnabled,
})
export class MessageThreadSubscriberWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceRelation({
    standardId: MESSAGE_THREAD_SUBSCRIBER_STANDARD_FIELD_IDS.messageThread,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Discussão de Mensagem',
    description: 'Discussão de Mensagem',
    icon: 'IconMessage',
    inverseSideFieldKey: 'subscribers',
    inverseSideTarget: () => MessageThreadWorkspaceEntity,
  })
  messageThread: Relation<MessageThreadWorkspaceEntity>;

  @WorkspaceJoinColumn('messageThread')
  messageThreadId: string;

  @WorkspaceRelation({
    standardId: MESSAGE_THREAD_SUBSCRIBER_STANDARD_FIELD_IDS.workspaceMember,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Membro do Workspace',
    description: 'Membro do Workspace que faz parte da discussão de mensagem',
    icon: 'IconCircleUser',
    inverseSideFieldKey: 'messageThreadSubscribers',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
  })
  workspaceMember: Relation<WorkspaceMemberWorkspaceEntity>;

  @WorkspaceJoinColumn('workspaceMember')
  workspaceMemberId: string;
}
