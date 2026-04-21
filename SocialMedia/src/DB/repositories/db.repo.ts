import type {
  Model,
  MongooseUpdateQueryOptions,
  ProjectionType,
  QueryFilter,
  QueryOptions,
  UpdateQuery,
} from "mongoose";

abstract class DBRepo<T> {
  constructor(protected model: Model<T>) {}

  public async findOne({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<T>;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T>;
  }) {
    return this.model.findOne(filter, projection, options);
  }

  public async find({
    filter,
    projection,
    options,
  }: {
    filter?: QueryFilter<T>;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T>;
  }) {
    return this.model.find(filter, projection, options);
  }

  public async findById({
    id,
    projection,
    options,
  }: {
    id: string;
    projection?: ProjectionType<T>;
    options?: QueryOptions<T>;
  }) {
    return this.model.findById(id, projection, options);
  }

  public async create(doc: T) {
    return this.model.create(doc);
  }

  public async updateOne({
    filter,
    update,
    options,
  }: {
    filter: QueryFilter<T>;
    update: UpdateQuery<T>;
    options?: MongooseUpdateQueryOptions<T>;
  }) {
    return this.model.updateOne(filter, update, options);
  }
}

export default DBRepo;
