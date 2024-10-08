import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

import { In, Repository } from 'typeorm';

import { FieldMetadataSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { createForeignKeyDeterministicUuid } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/create-deterministic-uuid.util';
import {
  ACTIVITY_TARGET_STANDARD_FIELD_IDS,
  ATTACHMENT_STANDARD_FIELD_IDS,
  FAVORITE_STANDARD_FIELD_IDS,
  TIMELINE_ACTIVITY_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { buildMigrationsToCreateRemoteTableRelations } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table-relations/utils/build-migrations-to-create-remote-table-relations.util';
import { buildMigrationsToRemoveRemoteTableRelations } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table-relations/utils/build-migrations-to-remove-remote-table-relations.util';
import { mapUdtNameToFieldType } from 'src/engine/metadata-modules/remote-server/remote-table/utils/udt-name-mapper.util';
import { createRelationForeignKeyFieldMetadataName } from 'src/engine/metadata-modules/relation-metadata/utils/create-relation-foreign-key-field-metadata-name.util';

@Injectable()
export class RemoteTableRelationsService {
  constructor(
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,

    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
  ) {}

  public async createForeignKeysMetadataAndMigrations(
    workspaceId: string,
    remoteObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType | 'default'>
      | undefined,
    objectPrimaryKeyColumnType?: string,
  ) {
    const objectPrimaryKeyFieldType = mapUdtNameToFieldType(
      objectPrimaryKeyColumnType ?? 'uuid',
    );

    const favoriteObjectMetadata = await this.createFavoriteRelation(
      workspaceId,
      remoteObjectMetadata,
      objectPrimaryKeyFieldType,
      objectPrimaryKeyFieldSettings,
    );

    const activityTargetObjectMetadata =
      await this.createActivityTargetRelation(
        workspaceId,
        remoteObjectMetadata,
        objectPrimaryKeyFieldType,
        objectPrimaryKeyFieldSettings,
      );

    const attachmentObjectMetadata = await this.createAttachmentRelation(
      workspaceId,
      remoteObjectMetadata,
      objectPrimaryKeyFieldType,
      objectPrimaryKeyFieldSettings,
    );

    const timelineActivityObjectMetadata =
      await this.createTimelineActivityRelation(
        workspaceId,
        remoteObjectMetadata,
        objectPrimaryKeyFieldType,
        objectPrimaryKeyFieldSettings,
      );

    // create migration to add foreign key columns
    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(
        `add-foreign-keys-${remoteObjectMetadata.nameSingular}`,
      ),
      workspaceId,
      buildMigrationsToCreateRemoteTableRelations(
        remoteObjectMetadata.nameSingular,
        [
          favoriteObjectMetadata,
          activityTargetObjectMetadata,
          attachmentObjectMetadata,
          timelineActivityObjectMetadata,
        ],
        objectPrimaryKeyColumnType ?? 'uuid',
      ),
    );
  }

  public async deleteForeignKeysMetadataAndCreateMigrations(
    workspaceId: string,
    remoteObjectMetadata: ObjectMetadataEntity,
  ) {
    // find favorite, activityTarget, attachment, timelineActivity objects
    const favoriteObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: 'favorite',
        workspaceId: workspaceId,
      });

    const activityTargetObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: 'activityTarget',
        workspaceId: workspaceId,
      });

    const attachmentObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: 'attachment',
        workspaceId: workspaceId,
      });

    const timelineActivityObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: 'timelineActivity',
        workspaceId: workspaceId,
      });

    // compute the target column name
    const targetColumnName = createRelationForeignKeyFieldMetadataName(
      remoteObjectMetadata.nameSingular,
    );

    // find the foreign key fields to delete
    const foreignKeyFieldsToDelete = await this.fieldMetadataRepository.find({
      where: {
        name: targetColumnName,
        objectMetadataId: In([
          favoriteObjectMetadata.id,
          activityTargetObjectMetadata.id,
          attachmentObjectMetadata.id,
          timelineActivityObjectMetadata.id,
        ]),
        workspaceId,
      },
    });

    const foreignKeyFieldsToDeleteIds = foreignKeyFieldsToDelete.map(
      (field) => field.id,
    );

    await this.fieldMetadataRepository.delete(foreignKeyFieldsToDeleteIds);

    // create migration to drop foreign key columns
    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(
        `delete-foreign-keys-${remoteObjectMetadata.nameSingular}`,
      ),
      workspaceId,
      buildMigrationsToRemoveRemoteTableRelations(targetColumnName, [
        favoriteObjectMetadata,
        activityTargetObjectMetadata,
        attachmentObjectMetadata,
        timelineActivityObjectMetadata,
      ]),
    );
  }

  private async createActivityTargetRelation(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyType: FieldMetadataType,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType | 'default'>
      | undefined,
  ) {
    const activityTargetObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: 'activityTarget',
        workspaceId: workspaceId,
      });

    await this.fieldMetadataRepository.save(
      // Foreign key
      {
        standardId: createForeignKeyDeterministicUuid({
          objectId: createdObjectMetadata.id,
          standardId: ACTIVITY_TARGET_STANDARD_FIELD_IDS.custom,
        }),
        objectMetadataId: activityTargetObjectMetadata.id,
        workspaceId: workspaceId,
        isCustom: false,
        isActive: true,
        type: objectPrimaryKeyType,
        name: `${createdObjectMetadata.nameSingular}Id`,
        label: `${createdObjectMetadata.labelSingular} ID (foreign key)`,
        description: `${createdObjectMetadata.labelSingular} alvo da atividade id foreign key`,
        icon: undefined,
        isNullable: true,
        isSystem: true,
        defaultValue: undefined,
        settings: { ...objectPrimaryKeyFieldSettings, isForeignKey: true },
      },
    );

    return activityTargetObjectMetadata;
  }

  private async createAttachmentRelation(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyType: FieldMetadataType,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType | 'default'>
      | undefined,
  ) {
    const attachmentObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: 'attachment',
        workspaceId: workspaceId,
      });

    await this.fieldMetadataRepository.save(
      // Foreign key
      {
        standardId: createForeignKeyDeterministicUuid({
          objectId: createdObjectMetadata.id,
          standardId: ATTACHMENT_STANDARD_FIELD_IDS.custom,
        }),
        objectMetadataId: attachmentObjectMetadata.id,
        workspaceId: workspaceId,
        isCustom: false,
        isActive: true,
        type: objectPrimaryKeyType,
        name: `${createdObjectMetadata.nameSingular}Id`,
        label: `${createdObjectMetadata.labelSingular} ID (foreign key)`,
        description: `${createdObjectMetadata.labelSingular} do anexo id foreign key`,
        icon: undefined,
        isNullable: true,
        isSystem: true,
        defaultValue: undefined,
        settings: { ...objectPrimaryKeyFieldSettings, isForeignKey: true },
      },
    );

    return attachmentObjectMetadata;
  }

  private async createTimelineActivityRelation(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyType: FieldMetadataType,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType | 'default'>
      | undefined,
  ) {
    const timelineActivityObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: 'timelineActivity',
        workspaceId: workspaceId,
      });

    await this.fieldMetadataRepository.save(
      // Foreign key
      {
        standardId: createForeignKeyDeterministicUuid({
          objectId: createdObjectMetadata.id,
          standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.custom,
        }),
        objectMetadataId: timelineActivityObjectMetadata.id,
        workspaceId: workspaceId,
        isCustom: false,
        isActive: true,
        type: objectPrimaryKeyType,
        name: `${createdObjectMetadata.nameSingular}Id`,
        label: `${createdObjectMetadata.labelSingular} ID (foreign key)`,
        description: `${createdObjectMetadata.labelSingular} da atividade da linha do tempo id foreign key`,
        icon: undefined,
        isNullable: true,
        isSystem: true,
        defaultValue: undefined,
        settings: { ...objectPrimaryKeyFieldSettings, isForeignKey: true },
      },
    );

    return timelineActivityObjectMetadata;
  }

  private async createFavoriteRelation(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyType: FieldMetadataType,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType | 'default'>
      | undefined,
  ) {
    const favoriteObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: 'favorite',
        workspaceId: workspaceId,
      });

    await this.fieldMetadataRepository.save(
      // Foreign key
      {
        standardId: createForeignKeyDeterministicUuid({
          objectId: createdObjectMetadata.id,
          standardId: FAVORITE_STANDARD_FIELD_IDS.custom,
        }),
        objectMetadataId: favoriteObjectMetadata.id,
        workspaceId: workspaceId,
        isCustom: false,
        isActive: true,
        type: objectPrimaryKeyType,
        name: `${createdObjectMetadata.nameSingular}Id`,
        label: `${createdObjectMetadata.labelSingular} ID (foreign key)`,
        description: `${createdObjectMetadata.labelSingular} favorito id foreign key`,
        icon: undefined,
        isNullable: true,
        isSystem: true,
        defaultValue: undefined,
        settings: { ...objectPrimaryKeyFieldSettings, isForeignKey: true },
      },
    );

    return favoriteObjectMetadata;
  }
}
