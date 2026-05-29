export abstract class BaseRepository<TEntity, TCreate, TUpdate, TId = string> {
  abstract findById(id: TId): Promise<TEntity | null>
  abstract findMany(filter?: Partial<TEntity>): Promise<TEntity[]>
  abstract create(data: TCreate): Promise<TEntity>
  abstract update(id: TId, data: TUpdate): Promise<TEntity>
  abstract delete(id: TId): Promise<void>
}
