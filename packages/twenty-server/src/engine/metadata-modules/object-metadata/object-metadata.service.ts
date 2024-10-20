import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import console from 'console';

import { Query, QueryOptions } from '@ptc-org/nestjs-query-core';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { isDefined } from 'class-validator';
import { FindManyOptions, FindOneOptions, In, Repository } from 'typeorm';

import { FieldMetadataSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';
import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  computeColumnName,
  FieldTypeAndNameMetadata,
} from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { IndexMetadataService } from 'src/engine/metadata-modules/index-metadata/index-metadata.service';
import { DeleteOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/delete-object.input';
import { UpdateOneObjectInput } from 'src/engine/metadata-modules/object-metadata/dtos/update-object.input';
import { DEFAULT_LABEL_IDENTIFIER_FIELD_NAME } from 'src/engine/metadata-modules/object-metadata/object-metadata.constants';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';
import { buildMigrationsForCustomObjectRelations } from 'src/engine/metadata-modules/object-metadata/utils/build-migrations-for-custom-object-relations.util';
import { validateObjectMetadataInputOrThrow } from 'src/engine/metadata-modules/object-metadata/utils/validate-object-metadata-input.util';
import {
  RelationMetadataEntity,
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { RelationToDelete } from 'src/engine/metadata-modules/relation-metadata/types/relation-to-delete';
import { RemoteTableRelationsService } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table-relations/remote-table-relations.service';
import { mapUdtNameToFieldType } from 'src/engine/metadata-modules/remote-server/remote-table/utils/udt-name-mapper.util';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { TsVectorColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/factories/ts-vector-column-action.factory';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnDrop,
  WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationFactory } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.factory';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration-runner/workspace-migration-runner.service';
import {
  ACTIVITY_TARGET_STANDARD_FIELD_IDS,
  ATTACHMENT_STANDARD_FIELD_IDS,
  BASE_OBJECT_STANDARD_FIELD_IDS,
  CUSTOM_OBJECT_STANDARD_FIELD_IDS,
  FAVORITE_STANDARD_FIELD_IDS,
  NOTE_TARGET_STANDARD_FIELD_IDS,
  TASK_TARGET_STANDARD_FIELD_IDS,
  TIMELINE_ACTIVITY_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import {
  createForeignKeyDeterministicUuid,
  createRelationDeterministicUuid,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/create-deterministic-uuid.util';
import { getTsVectorColumnExpressionFromFields } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';

import { ObjectMetadataEntity } from './object-metadata.entity';

import { CreateObjectInput } from './dtos/create-object.input';

@Injectable()
export class ObjectMetadataService extends TypeOrmQueryService<ObjectMetadataEntity> {
  constructor(
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,

    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,

    @InjectRepository(RelationMetadataEntity, 'metadata')
    private readonly relationMetadataRepository: Repository<RelationMetadataEntity>,

    private readonly remoteTableRelationsService: RemoteTableRelationsService,

    private readonly tsVectorColumnActionFactory: TsVectorColumnActionFactory,

    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly workspaceMigrationService: WorkspaceMigrationService,

    private readonly indexMetadataService: IndexMetadataService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workspaceMigrationFactory: WorkspaceMigrationFactory,
  ) {
    super(objectMetadataRepository);
  }

  override async query(
    query: Query<ObjectMetadataEntity>,
    opts?: QueryOptions<ObjectMetadataEntity> | undefined,
  ): Promise<ObjectMetadataEntity[]> {
    const start = performance.now();

    const result = super.query(query, opts);

    const end = performance.now();

    console.log(`metadata query time: ${end - start} ms`);

    return result;
  }

  public async deleteOneObject(
    input: DeleteOneObjectInput,
    workspaceId: string,
  ): Promise<ObjectMetadataEntity> {
    const objectMetadata = await this.objectMetadataRepository.findOne({
      relations: [
        'fromRelations.fromFieldMetadata',
        'fromRelations.toFieldMetadata',
        'toRelations.fromFieldMetadata',
        'toRelations.toFieldMetadata',
        'fromRelations.fromObjectMetadata',
        'fromRelations.toObjectMetadata',
        'toRelations.fromObjectMetadata',
        'toRelations.toObjectMetadata',
      ],
      where: {
        id: input.id,
        workspaceId,
      },
    });

    if (!objectMetadata) {
      throw new ObjectMetadataException(
        'Object does not exist',
        ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    // DELETE RELATIONS
    if (objectMetadata.isRemote) {
      await this.remoteTableRelationsService.deleteForeignKeysMetadataAndCreateMigrations(
        objectMetadata.workspaceId,
        objectMetadata,
      );
    } else {
      await this.deleteAllRelationsAndDropTable(objectMetadata, workspaceId);
    }

    // DELETE VIEWS
    const viewRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ViewWorkspaceEntity>(
        workspaceId,
        'view',
      );

    const views = await viewRepository.find({
      where: {
        objectMetadataId: objectMetadata.id,
      },
    });

    if (views.length > 0) {
      await viewRepository.delete(views.map((view) => view.id));
    }

    // DELETE OBJECT
    await this.objectMetadataRepository.delete(objectMetadata.id);

    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      workspaceId,
    );

    await this.workspaceMetadataVersionService.incrementMetadataVersion(
      workspaceId,
    );

    return objectMetadata;
  }

  override async createOne(
    objectMetadataInput: CreateObjectInput,
  ): Promise<ObjectMetadataEntity> {
    const lastDataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        objectMetadataInput.workspaceId,
      );

    validateObjectMetadataInputOrThrow(objectMetadataInput);

    if (
      objectMetadataInput.nameSingular.toLowerCase() ===
      objectMetadataInput.namePlural.toLowerCase()
    ) {
      throw new ObjectMetadataException(
        'The singular and plural name cannot be the same for an object',
        ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT,
      );
    }

    const objectAlreadyExists = await this.objectMetadataRepository.findOne({
      where: [
        {
          nameSingular: objectMetadataInput.nameSingular,
          workspaceId: objectMetadataInput.workspaceId,
        },
        {
          nameSingular: objectMetadataInput.namePlural,
          workspaceId: objectMetadataInput.workspaceId,
        },
        {
          namePlural: objectMetadataInput.nameSingular,
          workspaceId: objectMetadataInput.workspaceId,
        },
        {
          namePlural: objectMetadataInput.namePlural,
          workspaceId: objectMetadataInput.workspaceId,
        },
      ],
    });

    if (objectAlreadyExists) {
      throw new ObjectMetadataException(
        'Object already exists',
        ObjectMetadataExceptionCode.OBJECT_ALREADY_EXISTS,
      );
    }

    const isCustom = !objectMetadataInput.isRemote;

    const createdObjectMetadata = await super.createOne({
      ...objectMetadataInput,
      dataSourceId: lastDataSourceMetadata.id,
      targetTableName: 'DEPRECATED',
      isActive: true,
      isCustom: isCustom,
      isSystem: false,
      isRemote: objectMetadataInput.isRemote,
      fields: isCustom
        ? // Creating default fields.
          // No need to create a custom migration for this though as the default columns are already
          // created with default values which is not supported yet by workspace migrations.
          [
            {
              standardId: BASE_OBJECT_STANDARD_FIELD_IDS.id,
              type: FieldMetadataType.UUID,
              name: 'id',
              label: 'Id',
              icon: 'Icon123',
              description: 'Id',
              isNullable: false,
              isActive: true,
              isCustom: false,
              isSystem: true,
              workspaceId: objectMetadataInput.workspaceId,
              defaultValue: 'uuid',
            },
            {
              standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.name,
              type: FieldMetadataType.TEXT,
              name: 'name',
              label: 'Nome',
              icon: 'IconAbc',
              description: 'Nome',
              isNullable: false,
              isActive: true,
              isCustom: false,
              workspaceId: objectMetadataInput.workspaceId,
              defaultValue: "'Sem título'",
            },
            {
              standardId: BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
              type: FieldMetadataType.DATE_TIME,
              name: 'createdAt',
              label: 'Data de criação',
              icon: 'IconCalendar',
              description: 'Data de criação',
              isNullable: false,
              isActive: true,
              isCustom: false,
              workspaceId: objectMetadataInput.workspaceId,
              defaultValue: 'now',
            },
            {
              standardId: BASE_OBJECT_STANDARD_FIELD_IDS.updatedAt,
              type: FieldMetadataType.DATE_TIME,
              name: 'updatedAt',
              label: 'Última atualização',
              icon: 'IconCalendarClock',
              description: 'Última vez que o registro foi alterado',
              isNullable: false,
              isActive: true,
              isCustom: false,
              isSystem: false,
              workspaceId: objectMetadataInput.workspaceId,
              defaultValue: 'now',
            },
            {
              standardId: BASE_OBJECT_STANDARD_FIELD_IDS.deletedAt,
              type: FieldMetadataType.DATE_TIME,
              name: 'deletedAt',
              label: 'Excluído em',
              icon: 'IconCalendarClock',
              description: 'Data de exclusão',
              isNullable: true,
              isActive: true,
              isCustom: false,
              isSystem: false,
              workspaceId: objectMetadataInput.workspaceId,
              defaultValue: null,
            },
            {
              standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.createdBy,
              type: FieldMetadataType.ACTOR,
              name: 'createdBy',
              label: 'Criado por',
              icon: 'IconCreativeCommonsSa',
              description: 'O criador do registro',
              isNullable: false,
              isActive: true,
              isCustom: false,
              isSystem: false,
              workspaceId: objectMetadataInput.workspaceId,
              defaultValue: { name: "''", source: "'MANUAL'" },
            },
            {
              standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.position,
              type: FieldMetadataType.POSITION,
              name: 'position',
              label: 'Posição',
              icon: 'IconHierarchy2',
              description: 'Posição',
              isNullable: true,
              isActive: true,
              isCustom: false,
              isSystem: true,
              workspaceId: objectMetadataInput.workspaceId,
              defaultValue: null,
            },
          ]
        : // No fields for remote objects.
          [],
    });

    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        createdObjectMetadata.workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    if (isCustom) {
      await this.createObjectRelationsMetadataAndMigrations(
        objectMetadataInput,
        createdObjectMetadata,
      );

      const isSearchEnabled = await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IsSearchEnabled,
        objectMetadataInput.workspaceId,
      );

      if (isSearchEnabled) {
        await this.createSearchVectorField(
          objectMetadataInput,
          createdObjectMetadata,
        );
      }
    } else {
      await this.remoteTableRelationsService.createForeignKeysMetadataAndMigrations(
        objectMetadataInput.workspaceId,
        createdObjectMetadata,
        objectMetadataInput.primaryKeyFieldMetadataSettings,
        objectMetadataInput.primaryKeyColumnType,
      );
    }

    await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      createdObjectMetadata.workspaceId,
    );

    const view = await workspaceDataSource?.query(
      `INSERT INTO ${dataSourceMetadata.schema}."view"
      ("objectMetadataId", "type", "name", "key", "icon")
      VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        createdObjectMetadata.id,
        'table',
        'Todos',
        'INDEX',
        createdObjectMetadata.icon,
      ],
    );

    createdObjectMetadata.fields.map(async (field, index) => {
      if (field.name === 'id' || field.name === 'deletedAt') {
        return;
      }

      await workspaceDataSource?.query(
        `INSERT INTO ${dataSourceMetadata.schema}."viewField"
      ("fieldMetadataId", "position", "isVisible", "size", "viewId")
      VALUES ('${field.id}', '${index - 1}', true, 180, '${
        view[0].id
      }') RETURNING *`,
      );
    });

    await this.createViewWorkspaceFavorite(
      objectMetadataInput.workspaceId,
      view[0].id,
    );

    await this.workspaceMetadataVersionService.incrementMetadataVersion(
      objectMetadataInput.workspaceId,
    );

    return createdObjectMetadata;
  }

  public async updateOneObject(
    input: UpdateOneObjectInput,
    workspaceId: string,
  ): Promise<ObjectMetadataEntity> {
    validateObjectMetadataInputOrThrow(input.update);

    const updatedObject = await super.updateOne(input.id, input.update);

    if (input.update.isActive !== undefined) {
      await this.updateObjectRelationships(input.id, input.update.isActive);
    }

    await this.workspaceMetadataVersionService.incrementMetadataVersion(
      workspaceId,
    );

    return updatedObject;
  }

  public async findOneWithinWorkspace(
    workspaceId: string,
    options: FindOneOptions<ObjectMetadataEntity>,
  ): Promise<ObjectMetadataEntity | null> {
    return this.objectMetadataRepository.findOne({
      relations: [
        'fields',
        'fields.fromRelationMetadata',
        'fields.toRelationMetadata',
      ],
      ...options,
      where: {
        ...options.where,
        workspaceId,
      },
    });
  }

  public async findManyWithinWorkspace(
    workspaceId: string,
    options?: FindManyOptions<ObjectMetadataEntity>,
  ) {
    return this.objectMetadataRepository.find({
      relations: [
        'fields.object',
        'fields',
        'fields.fromRelationMetadata',
        'fields.toRelationMetadata',
        'fields.fromRelationMetadata.toObjectMetadata',
      ],
      ...options,
      where: {
        ...options?.where,
        workspaceId,
      },
    });
  }

  public async findMany(options?: FindManyOptions<ObjectMetadataEntity>) {
    return this.objectMetadataRepository.find({
      relations: [
        'fields',
        'fields.fromRelationMetadata',
        'fields.toRelationMetadata',
        'fields.fromRelationMetadata.toObjectMetadata',
      ],
      ...options,
      where: {
        ...options?.where,
      },
    });
  }

  public async deleteObjectsMetadata(workspaceId: string) {
    await this.objectMetadataRepository.delete({ workspaceId });
    await this.workspaceMetadataVersionService.incrementMetadataVersion(
      workspaceId,
    );
  }

  private async createObjectRelationsMetadataAndMigrations(
    objectMetadataInput: CreateObjectInput,
    createdObjectMetadata: ObjectMetadataEntity,
  ) {
    const { timelineActivityObjectMetadata } =
      await this.createTimelineActivityRelation(
        objectMetadataInput.workspaceId,
        createdObjectMetadata,
        mapUdtNameToFieldType(
          objectMetadataInput.primaryKeyColumnType ?? 'uuid',
        ),
        objectMetadataInput.primaryKeyFieldMetadataSettings,
      );

    const { activityTargetObjectMetadata } =
      await this.createActivityTargetRelation(
        objectMetadataInput.workspaceId,
        createdObjectMetadata,
        mapUdtNameToFieldType(
          objectMetadataInput.primaryKeyColumnType ?? 'uuid',
        ),
        objectMetadataInput.primaryKeyFieldMetadataSettings,
      );

    const { favoriteObjectMetadata } = await this.createFavoriteRelation(
      objectMetadataInput.workspaceId,
      createdObjectMetadata,
      mapUdtNameToFieldType(objectMetadataInput.primaryKeyColumnType ?? 'uuid'),
      objectMetadataInput.primaryKeyFieldMetadataSettings,
    );

    const { attachmentObjectMetadata } = await this.createAttachmentRelation(
      objectMetadataInput.workspaceId,
      createdObjectMetadata,
      mapUdtNameToFieldType(objectMetadataInput.primaryKeyColumnType ?? 'uuid'),
      objectMetadataInput.primaryKeyFieldMetadataSettings,
    );

    const { noteTargetObjectMetadata } = await this.createNoteTargetRelation(
      objectMetadataInput.workspaceId,
      createdObjectMetadata,
      mapUdtNameToFieldType(objectMetadataInput.primaryKeyColumnType ?? 'uuid'),
      objectMetadataInput.primaryKeyFieldMetadataSettings,
    );

    const { taskTargetObjectMetadata } = await this.createTaskTargetRelation(
      objectMetadataInput.workspaceId,
      createdObjectMetadata,
      mapUdtNameToFieldType(objectMetadataInput.primaryKeyColumnType ?? 'uuid'),
      objectMetadataInput.primaryKeyFieldMetadataSettings,
    );

    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`create-${createdObjectMetadata.nameSingular}`),
      createdObjectMetadata.workspaceId,
      [
        {
          name: computeObjectTargetTable(createdObjectMetadata),
          action: WorkspaceMigrationTableActionType.CREATE,
        } satisfies WorkspaceMigrationTableAction,
      ],
    );

    for (const fieldMetadata of createdObjectMetadata.fields) {
      await this.workspaceMigrationService.createCustomMigration(
        generateMigrationName(`create-${fieldMetadata.name}`),
        createdObjectMetadata.workspaceId,
        [
          {
            name: computeObjectTargetTable(createdObjectMetadata),
            action: WorkspaceMigrationTableActionType.ALTER,
            columns: this.workspaceMigrationFactory.createColumnActions(
              WorkspaceMigrationColumnActionType.CREATE,
              fieldMetadata,
            ),
          },
        ] satisfies WorkspaceMigrationTableAction[],
      );
    }

    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(
        `create-${createdObjectMetadata.nameSingular}-relations`,
      ),
      createdObjectMetadata.workspaceId,
      buildMigrationsForCustomObjectRelations(
        createdObjectMetadata,
        activityTargetObjectMetadata,
        attachmentObjectMetadata,
        timelineActivityObjectMetadata,
        favoriteObjectMetadata,
        noteTargetObjectMetadata,
        taskTargetObjectMetadata,
      ),
    );
  }

  private async createSearchVectorField(
    objectMetadataInput: CreateObjectInput,
    createdObjectMetadata: ObjectMetadataEntity,
  ) {
    const searchVectorFieldMetadata = await this.fieldMetadataRepository.save({
      standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.searchVector,
      objectMetadataId: createdObjectMetadata.id,
      workspaceId: objectMetadataInput.workspaceId,
      isCustom: false,
      isActive: false,
      isSystem: true,
      type: FieldMetadataType.TS_VECTOR,
      name: SEARCH_VECTOR_FIELD.name,
      label: SEARCH_VECTOR_FIELD.label,
      description: SEARCH_VECTOR_FIELD.description,
      isNullable: true,
    });

    const searchableFieldForCustomObject =
      createdObjectMetadata.labelIdentifierFieldMetadataId
        ? createdObjectMetadata.fields.find(
            (field) =>
              field.id === createdObjectMetadata.labelIdentifierFieldMetadataId,
          )
        : createdObjectMetadata.fields.find(
            (field) => field.name === DEFAULT_LABEL_IDENTIFIER_FIELD_NAME,
          );

    if (!isDefined(searchableFieldForCustomObject)) {
      throw new Error('No searchable field found for custom object');
    }

    this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(
        `update-${createdObjectMetadata.nameSingular}-add-searchVector`,
      ),
      createdObjectMetadata.workspaceId,
      [
        {
          name: computeTableName(
            createdObjectMetadata.nameSingular,
            createdObjectMetadata.isCustom,
          ),
          action: WorkspaceMigrationTableActionType.ALTER,
          columns: this.tsVectorColumnActionFactory.handleCreateAction({
            ...searchVectorFieldMetadata,
            defaultValue: undefined,
            generatedType: 'STORED',
            asExpression: getTsVectorColumnExpressionFromFields([
              searchableFieldForCustomObject as FieldTypeAndNameMetadata,
            ]),
            options: undefined,
          } as FieldMetadataInterface<FieldMetadataType.TS_VECTOR>),
        },
      ],
    );

    await this.indexMetadataService.createIndex(
      objectMetadataInput.workspaceId,
      createdObjectMetadata,
      [searchVectorFieldMetadata],
      false,
      IndexType.GIN,
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

    const activityTargetRelationFieldMetadata =
      await this.fieldMetadataRepository.save([
        // FROM
        {
          standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.activityTargets,
          objectMetadataId: createdObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: false,
          isActive: true,
          isSystem: true,
          type: FieldMetadataType.RELATION,
          name: 'activityTargets',
          label: 'Atividades',
          description: `Atividades vinculadas ao ${createdObjectMetadata.labelSingular}`,
          icon: 'IconCheckbox',
          isNullable: true,
        },
        // TO
        {
          standardId: createRelationDeterministicUuid({
            objectId: createdObjectMetadata.id,
            standardId: ACTIVITY_TARGET_STANDARD_FIELD_IDS.custom,
          }),
          objectMetadataId: activityTargetObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: false,
          isActive: true,
          isSystem: true,
          type: FieldMetadataType.RELATION,
          name: createdObjectMetadata.nameSingular,
          label: createdObjectMetadata.labelSingular,
          description: `${createdObjectMetadata.labelSingular} alvo da atividade`,
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
        },
      ]);

    const activityTargetRelationFieldMetadataMap =
      activityTargetRelationFieldMetadata.reduce(
        (acc, fieldMetadata: FieldMetadataEntity) => {
          if (fieldMetadata.type === FieldMetadataType.RELATION) {
            acc[fieldMetadata.objectMetadataId] = fieldMetadata;
          }

          return acc;
        },
        {},
      );

    await this.relationMetadataRepository.save([
      {
        workspaceId: workspaceId,
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: createdObjectMetadata.id,
        toObjectMetadataId: activityTargetObjectMetadata.id,
        fromFieldMetadataId:
          activityTargetRelationFieldMetadataMap[createdObjectMetadata.id].id,
        toFieldMetadataId:
          activityTargetRelationFieldMetadataMap[
            activityTargetObjectMetadata.id
          ].id,
        onDeleteAction: RelationOnDeleteAction.CASCADE,
      },
    ]);

    return { activityTargetObjectMetadata };
  }

  private async createNoteTargetRelation(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyType: FieldMetadataType,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType | 'default'>
      | undefined,
  ) {
    const noteTargetObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: 'noteTarget',
        workspaceId: workspaceId,
      });

    await this.fieldMetadataRepository.save(
      // Foreign key
      {
        standardId: createForeignKeyDeterministicUuid({
          objectId: createdObjectMetadata.id,
          standardId: NOTE_TARGET_STANDARD_FIELD_IDS.custom,
        }),
        objectMetadataId: noteTargetObjectMetadata.id,
        workspaceId: workspaceId,
        isCustom: false,
        isActive: true,
        type: objectPrimaryKeyType,
        name: `${createdObjectMetadata.nameSingular}Id`,
        label: `${createdObjectMetadata.labelSingular} ID (foreign key)`,
        description: `${createdObjectMetadata.labelSingular} alvo da nota id foreign key`,
        icon: undefined,
        isNullable: true,
        isSystem: true,
        defaultValue: undefined,
        settings: { ...objectPrimaryKeyFieldSettings, isForeignKey: true },
      },
    );

    const noteTargetRelationFieldMetadata =
      await this.fieldMetadataRepository.save([
        // FROM
        {
          standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.noteTargets,
          objectMetadataId: createdObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: false,
          isActive: true,
          type: FieldMetadataType.RELATION,
          name: 'noteTargets',
          label: 'Notas',
          description: `Notas vinculadas ao ${createdObjectMetadata.labelSingular}`,
          icon: 'IconNotes',
          isNullable: true,
        },
        // TO
        {
          standardId: createRelationDeterministicUuid({
            objectId: createdObjectMetadata.id,
            standardId: NOTE_TARGET_STANDARD_FIELD_IDS.custom,
          }),
          objectMetadataId: noteTargetObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: false,
          isActive: true,
          type: FieldMetadataType.RELATION,
          name: createdObjectMetadata.nameSingular,
          label: createdObjectMetadata.labelSingular,
          description: `${createdObjectMetadata.labelSingular} alvo da nota`,
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
        },
      ]);

    const noteTargetRelationFieldMetadataMap =
      noteTargetRelationFieldMetadata.reduce(
        (acc, fieldMetadata: FieldMetadataEntity) => {
          if (fieldMetadata.type === FieldMetadataType.RELATION) {
            acc[fieldMetadata.objectMetadataId] = fieldMetadata;
          }

          return acc;
        },
        {},
      );

    await this.relationMetadataRepository.save([
      {
        workspaceId: workspaceId,
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: createdObjectMetadata.id,
        toObjectMetadataId: noteTargetObjectMetadata.id,
        fromFieldMetadataId:
          noteTargetRelationFieldMetadataMap[createdObjectMetadata.id].id,
        toFieldMetadataId:
          noteTargetRelationFieldMetadataMap[noteTargetObjectMetadata.id].id,
        onDeleteAction: RelationOnDeleteAction.CASCADE,
      },
    ]);

    return { noteTargetObjectMetadata };
  }

  private async createTaskTargetRelation(
    workspaceId: string,
    createdObjectMetadata: ObjectMetadataEntity,
    objectPrimaryKeyType: FieldMetadataType,
    objectPrimaryKeyFieldSettings:
      | FieldMetadataSettings<FieldMetadataType | 'default'>
      | undefined,
  ) {
    const taskTargetObjectMetadata =
      await this.objectMetadataRepository.findOneByOrFail({
        nameSingular: 'taskTarget',
        workspaceId: workspaceId,
      });

    await this.fieldMetadataRepository.save(
      // Foreign key
      {
        standardId: createForeignKeyDeterministicUuid({
          objectId: createdObjectMetadata.id,
          standardId: TASK_TARGET_STANDARD_FIELD_IDS.custom,
        }),
        objectMetadataId: taskTargetObjectMetadata.id,
        workspaceId: workspaceId,
        isCustom: false,
        isActive: true,
        type: objectPrimaryKeyType,
        name: `${createdObjectMetadata.nameSingular}Id`,
        label: `${createdObjectMetadata.labelSingular} ID (foreign key)`,
        description: `${createdObjectMetadata.labelSingular} alvo da tarefa id foreign key`,
        icon: undefined,
        isNullable: true,
        isSystem: true,
        defaultValue: undefined,
        settings: { ...objectPrimaryKeyFieldSettings, isForeignKey: true },
      },
    );

    const taskTargetRelationFieldMetadata =
      await this.fieldMetadataRepository.save([
        // FROM
        {
          standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.taskTargets,
          objectMetadataId: createdObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: false,
          isActive: true,
          type: FieldMetadataType.RELATION,
          name: 'taskTargets',
          label: 'Tarefas',
          description: `Tarefas vinculadas ao ${createdObjectMetadata.labelSingular}`,
          icon: 'IconCheckbox',
          isNullable: true,
        },
        // TO
        {
          standardId: createRelationDeterministicUuid({
            objectId: createdObjectMetadata.id,
            standardId: TASK_TARGET_STANDARD_FIELD_IDS.custom,
          }),
          objectMetadataId: taskTargetObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: false,
          isActive: true,
          type: FieldMetadataType.RELATION,
          name: createdObjectMetadata.nameSingular,
          label: createdObjectMetadata.labelSingular,
          description: `${createdObjectMetadata.labelSingular} alvo da tarefa`,
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
        },
      ]);

    const taskTargetRelationFieldMetadataMap =
      taskTargetRelationFieldMetadata.reduce(
        (acc, fieldMetadata: FieldMetadataEntity) => {
          if (fieldMetadata.type === FieldMetadataType.RELATION) {
            acc[fieldMetadata.objectMetadataId] = fieldMetadata;
          }

          return acc;
        },
        {},
      );

    await this.relationMetadataRepository.save([
      {
        workspaceId: workspaceId,
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: createdObjectMetadata.id,
        toObjectMetadataId: taskTargetObjectMetadata.id,
        fromFieldMetadataId:
          taskTargetRelationFieldMetadataMap[createdObjectMetadata.id].id,
        toFieldMetadataId:
          taskTargetRelationFieldMetadataMap[taskTargetObjectMetadata.id].id,
        onDeleteAction: RelationOnDeleteAction.CASCADE,
      },
    ]);

    return { taskTargetObjectMetadata };
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

    const attachmentRelationFieldMetadata =
      await this.fieldMetadataRepository.save([
        // FROM
        {
          standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.attachments,
          objectMetadataId: createdObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: false,
          isActive: true,
          type: FieldMetadataType.RELATION,
          name: 'attachments',
          label: 'Anexos',
          description: `Anexos vinculados ao ${createdObjectMetadata.labelSingular}`,
          icon: 'IconFileImport',
          isNullable: true,
        },
        // TO
        {
          standardId: createRelationDeterministicUuid({
            objectId: createdObjectMetadata.id,
            standardId: ATTACHMENT_STANDARD_FIELD_IDS.custom,
          }),
          objectMetadataId: attachmentObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: false,
          isActive: true,
          type: FieldMetadataType.RELATION,
          name: createdObjectMetadata.nameSingular,
          label: createdObjectMetadata.labelSingular,
          description: `${createdObjectMetadata.labelSingular} do anexo`,
          icon: 'IconBuildingSkyscraper',
          isNullable: true,
        },
      ]);

    const attachmentRelationFieldMetadataMap =
      attachmentRelationFieldMetadata.reduce(
        (acc, fieldMetadata: FieldMetadataEntity) => {
          if (fieldMetadata.type === FieldMetadataType.RELATION) {
            acc[fieldMetadata.objectMetadataId] = fieldMetadata;
          }

          return acc;
        },
        {},
      );

    await this.relationMetadataRepository.save([
      {
        workspaceId: workspaceId,
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: createdObjectMetadata.id,
        toObjectMetadataId: attachmentObjectMetadata.id,
        fromFieldMetadataId:
          attachmentRelationFieldMetadataMap[createdObjectMetadata.id].id,
        toFieldMetadataId:
          attachmentRelationFieldMetadataMap[attachmentObjectMetadata.id].id,
        onDeleteAction: RelationOnDeleteAction.CASCADE,
      },
    ]);

    return { attachmentObjectMetadata };
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

    const timelineActivityRelationFieldMetadata =
      await this.fieldMetadataRepository.save([
        // FROM
        {
          standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.timelineActivities,
          objectMetadataId: createdObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: false,
          isActive: true,
          type: FieldMetadataType.RELATION,
          name: 'timelineActivities',
          label: 'Atividades da linha do tempo',
          description: `Atividades da linha do tempo vinculada ao ${createdObjectMetadata.labelSingular}`,
          icon: 'IconIconTimelineEvent',
          isNullable: true,
          isSystem: true,
        },
        // TO
        {
          standardId: createRelationDeterministicUuid({
            objectId: createdObjectMetadata.id,
            standardId: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.custom,
          }),
          objectMetadataId: timelineActivityObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: false,
          isActive: true,
          type: FieldMetadataType.RELATION,
          name: createdObjectMetadata.nameSingular,
          label: createdObjectMetadata.labelSingular,
          description: `${createdObjectMetadata.labelSingular} da atividade da linha do tempo`,
          icon: 'IconTimeline',
          isNullable: true,
        },
      ]);

    const timelineActivityRelationFieldMetadataMap =
      timelineActivityRelationFieldMetadata.reduce(
        (acc, fieldMetadata: FieldMetadataEntity) => {
          if (fieldMetadata.type === FieldMetadataType.RELATION) {
            acc[fieldMetadata.objectMetadataId] = fieldMetadata;
          }

          return acc;
        },
        {},
      );

    await this.relationMetadataRepository.save([
      {
        workspaceId: workspaceId,
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: createdObjectMetadata.id,
        toObjectMetadataId: timelineActivityObjectMetadata.id,
        fromFieldMetadataId:
          timelineActivityRelationFieldMetadataMap[createdObjectMetadata.id].id,
        toFieldMetadataId:
          timelineActivityRelationFieldMetadataMap[
            timelineActivityObjectMetadata.id
          ].id,
        onDeleteAction: RelationOnDeleteAction.CASCADE,
      },
    ]);

    return { timelineActivityObjectMetadata };
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

    const favoriteRelationFieldMetadata =
      await this.fieldMetadataRepository.save([
        // FROM
        {
          standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.favorites,
          objectMetadataId: createdObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: false,
          isActive: true,
          isSystem: true,
          type: FieldMetadataType.RELATION,
          name: 'favorites',
          label: 'Favoritos',
          description: `Favoritos vinculados ao ${createdObjectMetadata.labelSingular}`,
          icon: 'IconHeart',
          isNullable: true,
        },
        // TO
        {
          standardId: createRelationDeterministicUuid({
            objectId: createdObjectMetadata.id,
            standardId: FAVORITE_STANDARD_FIELD_IDS.custom,
          }),
          objectMetadataId: favoriteObjectMetadata.id,
          workspaceId: workspaceId,
          isCustom: false,
          isActive: true,
          type: FieldMetadataType.RELATION,
          name: createdObjectMetadata.nameSingular,
          label: createdObjectMetadata.labelSingular,
          description: `${createdObjectMetadata.labelSingular} favorito`,
          icon: 'IconHeart',
          isNullable: true,
        },
      ]);

    const favoriteRelationFieldMetadataMap =
      favoriteRelationFieldMetadata.reduce(
        (acc, fieldMetadata: FieldMetadataEntity) => {
          if (fieldMetadata.type === FieldMetadataType.RELATION) {
            acc[fieldMetadata.objectMetadataId] = fieldMetadata;
          }

          return acc;
        },
        {},
      );

    await this.relationMetadataRepository.save([
      {
        workspaceId: workspaceId,
        relationType: RelationMetadataType.ONE_TO_MANY,
        fromObjectMetadataId: createdObjectMetadata.id,
        toObjectMetadataId: favoriteObjectMetadata.id,
        fromFieldMetadataId:
          favoriteRelationFieldMetadataMap[createdObjectMetadata.id].id,
        toFieldMetadataId:
          favoriteRelationFieldMetadataMap[favoriteObjectMetadata.id].id,
        onDeleteAction: RelationOnDeleteAction.CASCADE,
      },
    ]);

    return { favoriteObjectMetadata };
  }

  private async deleteAllRelationsAndDropTable(
    objectMetadata: ObjectMetadataEntity,
    workspaceId: string,
  ) {
    const relationsToDelete: RelationToDelete[] = [];

    // TODO: Most of this logic should be moved to relation-metadata.service.ts
    for (const relation of [
      ...objectMetadata.fromRelations,
      ...objectMetadata.toRelations,
    ]) {
      relationsToDelete.push({
        id: relation.id,
        fromFieldMetadataId: relation.fromFieldMetadata.id,
        toFieldMetadataId: relation.toFieldMetadata.id,
        fromFieldMetadataName: relation.fromFieldMetadata.name,
        toFieldMetadataName: relation.toFieldMetadata.name,
        fromObjectMetadataId: relation.fromObjectMetadata.id,
        toObjectMetadataId: relation.toObjectMetadata.id,
        fromObjectName: relation.fromObjectMetadata.nameSingular,
        toObjectName: relation.toObjectMetadata.nameSingular,
        toFieldMetadataIsCustom: relation.toFieldMetadata.isCustom,
        toObjectMetadataIsCustom: relation.toObjectMetadata.isCustom,
        direction:
          relation.fromObjectMetadata.nameSingular ===
          objectMetadata.nameSingular
            ? 'from'
            : 'to',
      });
    }

    if (relationsToDelete.length > 0) {
      await this.relationMetadataRepository.delete(
        relationsToDelete.map((relation) => relation.id),
      );
    }

    for (const relationToDelete of relationsToDelete) {
      const foreignKeyFieldsToDelete = await this.fieldMetadataRepository.find({
        where: {
          name: `${relationToDelete.toFieldMetadataName}Id`,
          objectMetadataId: relationToDelete.toObjectMetadataId,
          workspaceId,
        },
      });

      const foreignKeyFieldsToDeleteIds = foreignKeyFieldsToDelete.map(
        (field) => field.id,
      );

      await this.fieldMetadataRepository.delete([
        ...foreignKeyFieldsToDeleteIds,
        relationToDelete.fromFieldMetadataId,
        relationToDelete.toFieldMetadataId,
      ]);

      if (relationToDelete.direction === 'from') {
        await this.workspaceMigrationService.createCustomMigration(
          generateMigrationName(
            `delete-${relationToDelete.fromObjectName}-${relationToDelete.toObjectName}`,
          ),
          workspaceId,
          [
            {
              name: computeTableName(
                relationToDelete.toObjectName,
                relationToDelete.toObjectMetadataIsCustom,
              ),
              action: WorkspaceMigrationTableActionType.ALTER,
              columns: [
                {
                  action: WorkspaceMigrationColumnActionType.DROP,
                  columnName: computeColumnName(
                    relationToDelete.toFieldMetadataName,
                    { isForeignKey: true },
                  ),
                } satisfies WorkspaceMigrationColumnDrop,
              ],
            },
          ],
        );
      }
    }

    // DROP TABLE
    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`delete-${objectMetadata.nameSingular}`),
      workspaceId,
      [
        {
          name: computeObjectTargetTable(objectMetadata),
          action: WorkspaceMigrationTableActionType.DROP,
        },
      ],
    );
  }

  private async updateObjectRelationships(
    objectMetadataId: string,
    isActive: boolean,
  ) {
    const affectedRelations = await this.relationMetadataRepository.find({
      where: [
        { fromObjectMetadataId: objectMetadataId },
        { toObjectMetadataId: objectMetadataId },
      ],
    });

    const affectedFieldIds = affectedRelations.reduce(
      (acc, { fromFieldMetadataId, toFieldMetadataId }) => {
        acc.push(fromFieldMetadataId, toFieldMetadataId);

        return acc;
      },
      [] as string[],
    );

    if (affectedFieldIds.length > 0) {
      await this.fieldMetadataRepository.update(
        { id: In(affectedFieldIds) },
        { isActive: isActive },
      );
    }
  }

  private async createViewWorkspaceFavorite(
    workspaceId: string,
    viewId: string,
  ) {
    const favoriteRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<FavoriteWorkspaceEntity>(
        workspaceId,
        'favorite',
      );

    const favoriteCount = await favoriteRepository.count();

    return favoriteRepository.insert(
      favoriteRepository.create({
        viewId,
        position: favoriteCount,
      }),
    );
  }
}
