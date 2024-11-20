export const cool = `
/**
 * Repository
 */
interface Repository {
	/**
	 * any target that is managed by this repository.
	 * If this repository manages any from schema,
	 * then it returns a name of that schema instead.
	 */
	readonly target: any;
	/**
	 * any Manager used by this repository.
	 */
	readonly manager: any;
	/**
	 * Query runner provider used for this repository.
	 */
	readonly queryRunner?: any;
	/**
	 * any metadata of the any current repository manages.
	 */
	get metadata(): any;
	/**
	 * Creates a new query builder that can be used to build a SQL query.
	 */
	createQueryBuilder(alias?: string, queryRunner?: any): any;
	/**
	 * Checks if any has an id.
	 * If any composite compose ids, it will check them all.
	 */
	hasId(any: any): boolean;
	/**
	 * Gets any mixed id.
	 */
	getId(any: any): any;
	/**
	 * Creates a new any instance.
	 */
	create(): any;
	/**
	 * Creates new entities and copies all any properties from given objects into their new entities.
	 * Note that it copies only properties that are present in any schema.
	 */
	create(anyLikeArray: any): any[];
	/**
	 * Creates a new any instance and copies all any properties from this object into a new any.
	 * Note that it copies only properties that are present in any schema.
	 */
	create(anyLike: any): any;
	/**
	 * Merges multiple entities (or any-like objects) into a given any.
	 */
	merge(mergeIntoany: any, ...anyLikes: any): any;
	/**
	 * Creates a new any from the given plain javascript object. If any already exist in the database, then
	 * it loads it (and everything related to it), replaces all values with the new ones from the given object
	 * and returns this new any. This new any is actually a loaded from the db any with all properties
	 * replaced from the new object.
	 *
	 * Note that given any-like object must have an any id / primary key to find any by.
	 * Returns undefined if any with given id was not found.
	 */
	preload(anyLike: any): Promise<any | undefined>;
	/**
	 * Saves all given entities in the database.
	 * If entities do not exist in the database then inserts, otherwise updates.
	 */
	save(
		entities: any[],
		options: any & {
			reload: false;
		}
	): Promise<any[]>;
	/**
	 * Saves all given entities in the database.
	 * If entities do not exist in the database then inserts, otherwise updates.
	 */
	save(entities: any[], options?: any): Promise<any[]>;
	/**
	 * Saves a given any in the database.
	 * If any does not exist in the database then inserts, otherwise updates.
	 */
	save(
		any: any,
		options: any & {
			reload: false;
		}
	): Promise<any>;
	/**
	 * Saves a given any in the database.
	 * If any does not exist in the database then inserts, otherwise updates.
	 */
	save(any: any, options?: any): any;
	/**
	 * Removes a given entities from the database.
	 */
	remove(entities: any[], options?: any): Promise<any[]>;
	/**
	 * Removes a given any from the database.
	 */
	remove(any: any, options?: any): Promise<any>;
	/**
	 * Records the delete date of all given entities.
	 */
	softRemove(
		entities: any[],
		options: any & {
			reload: false;
		}
	): Promise<any[]>;
	/**
	 * Records the delete date of all given entities.
	 */
	softRemove(entities: any[], options?: any): Promise<any[]>;
	/**
	 * Records the delete date of a given any.
	 */
	softRemove(
		any: any,
		options: any & {
			reload: false;
		}
	): Promise<any>;
	/**
	 * Records the delete date of a given any.
	 */
	softRemove(any: any, options?: any): Promise<any>;
	/**
	 * Recovers all given entities in the database.
	 */
	recover(
		entities: any[],
		options: any & {
			reload: false;
		}
	): Promise<any[]>;
	/**
	 * Recovers all given entities in the database.
	 */
	recover(entities: any[], options?: any): Promise<any[]>;
	/**
	 * Recovers a given any in the database.
	 */
	recover(
		any: any,
		options: any & {
			reload: false;
		}
	): Promise<any>;
	/**
	 * Recovers a given any in the database.
	 */
	recover(any: any, options?: any): Promise<any>;
	/**
	 * Inserts a given any into the database.
	 * Unlike save method executes a primitive operation without cascades, relations and other operations included.
	 * Executes fast and efficient INSERT query.
	 * Does not check if any exist in the database, so query will fail if duplicate any is being inserted.
	 */
	insert(any: any | any[]): Promise<any>;
	/**
	 * Updates any partially. any can be found by a given conditions.
	 * Unlike save method executes a primitive operation without cascades, relations and other operations included.
	 * Executes fast and efficient UPDATE query.
	 * Does not check if any exist in the database.
	 */
	update(criteria: any, partialany: any): Promise<any>;
	/**
	 * Inserts a given any into the database, unless a unique constraint conflicts then updates the any
	 * Unlike save method executes a primitive operation without cascades, relations and other operations included.
	 * Executes fast and efficient INSERT ... ON CONFLICT DO UPDATE/ON DUPLICATE KEY UPDATE query.
	 */
	upsert(anyOrEntities: any | any[], conflictPathsOrOptions: string[] | any): Promise<any>;
	/**
	 * Deletes entities by a given criteria.
	 * Unlike save method executes a primitive operation without cascades, relations and other operations included.
	 * Executes fast and efficient DELETE query.
	 * Does not check if any exist in the database.
	 */
	delete(criteria: any): Promise<any>;
	/**
	 * Records the delete date of entities by a given criteria.
	 * Unlike save method executes a primitive operation without cascades, relations and other operations included.
	 * Executes fast and efficient SOFT-DELETE query.
	 * Does not check if any exist in the database.
	 */
	softDelete(criteria: any): Promise<any>;
	/**
	 * Restores entities by a given criteria.
	 * Unlike save method executes a primitive operation without cascades, relations and other operations included.
	 * Executes fast and efficient SOFT-DELETE query.
	 * Does not check if any exist in the database.
	 */
	restore(criteria: any): Promise<any>;
	/**
	 * Checks whether any any exists that matches the given options.
	 *
	 * @deprecated use \`exists\` method instead, for example:
	 *
	 * .exists()
	 */
	exist(options?: any): Promise<boolean>;
	/**
	 * Checks whether any any exists that matches the given options.
	 */
	exists(options?: any): Promise<boolean>;
	/**
	 * Checks whether any any exists that matches the given conditions.
	 */
	existsBy(where: any | any[]): Promise<boolean>;
	/**
	 * Counts entities that match given options.
	 * Useful for pagination.
	 */
	count(options?: any): Promise<number>;
	/**
	 * Counts entities that match given conditions.
	 * Useful for pagination.
	 */
	countBy(where: any | any[]): Promise<number>;
	/**
	 * Return the SUM of a column
	 */
	sum(columnName: any, where?: any | any[]): Promise<number | null>;
	/**
	 * Return the AVG of a column
	 */
	average(columnName: any, where?: any | any[]): Promise<number | null>;
	/**
	 * Return the MIN of a column
	 */
	minimum(columnName: any, where?: any | any[]): Promise<number | null>;
	/**
	 * Return the MAX of a column
	 */
	maximum(columnName: any, where?: any | any[]): Promise<number | null>;
	/**
	 * Finds entities that match given find options.
	 */
	find(options?: any): Promise<any[]>;
	/**
	 * Finds entities that match given find options.
	 */
	findBy(where: any | any[]): Promise<any[]>;
	/**
	 * Finds entities that match given find options.
	 * Also counts all entities that match given conditions,
	 * but ignores pagination settings (from and take options).
	 */
	findAndCount(options?: any): Promise<[any[], number]>;
	/**
	 * Finds entities that match given WHERE conditions.
	 * Also counts all entities that match given conditions,
	 * but ignores pagination settings (from and take options).
	 */
	findAndCountBy(where: any | any[]): Promise<[any[], number]>;
	/**
	 * Finds entities with ids.
	 * Optionally find options or conditions can be applied.
	 *
	 * @deprecated use \`findBy\` method instead in conjunction with \`In\` operator, for example:
	 *
	 * .findBy({
	 *     id: In([1, 2, 3])
	 * })
	 */
	findByIds(ids: any[]): Promise<any[]>;
	/**
	 * Finds first any by a given find options.
	 * If any was not found in the database - returns null.
	 */
	findOne(options: any): Promise<any | null>;
	/**
	 * Finds first any that matches given where condition.
	 * If any was not found in the database - returns null.
	 */
	findOneBy(where: any | any[]): Promise<any | null>;
	/**
	 * Finds first any that matches given id.
	 * If any was not found in the database - returns null.
	 *
	 * @deprecated use \`findOneBy\` method instead in conjunction with \`In\` operator, for example:
	 *
	 * .findOneBy({
	 *     id: 1 // where "id" is your primary column name
	 * })
	 */
	findOneById(id: number | string | Date | any): Promise<any | null>;
	/**
	 * Finds first any by a given find options.
	 * If any was not found in the database - rejects with error.
	 */
	findOneOrFail(options: any): Promise<any>;
	/**
	 * Finds first any that matches given where condition.
	 * If any was not found in the database - rejects with error.
	 */
	findOneByOrFail(where: any | any[]): Promise<any>;
	/**
	 * Executes a raw SQL query and returns a raw database results.
	 * Raw query execution is supported only by relational databases (MongoDB is not supported).
	 */
	query(query: string, parameters?: any[]): Promise<any>;
	/**
	 * Clears all the data from the given table/collection (truncates/drops it).
	 *
	 * Note: this method uses TRUNCATE and may not work as you expect in transactions on some platforms.
	 * @see https://stackoverflow.com/a/5972738/925151
	 */
	clear(): Promise<void>;
	/**
	 * Increments some column by provided value of the entities matched given conditions.
	 */
	increment(conditions: any, propertyPath: string, value: number | string): Promise<any>;
	/**
	 * Decrements some column by provided value of the entities matched given conditions.
	 */
	decrement(conditions: any, propertyPath: string, value: number | string): Promise<any>;
	/**
	 * Extends repository with provided functions.
	 */
	extend<CustomRepository>(
		customs: CustomRepository & ThisType<this & CustomRepository>
	): this & CustomRepository;

	[key: string]: any;
}

/**
 * App
 */
interface App {
	/**
	 * 获得基础目录
	 */
	getBaseDir(): string;
	/**
	 * 获得应用目录
	 */
	getAppDir(): string;
	/**
	 * 获得环境
	 */
	getEnv(): string;
	/**
	 * 获得框架
	 */
	getFramework(): any;
	/**
	 * 获得当前进程类型
	 */
	getProcessType(): any;
	/**
	 * 获得全局容器
	 */
	getApplicationContext(): any;
	/**
	 * 获得配置
	 * @param key 配置key
	 */
	getConfig(key?: string): any;
	/**
	 * 获得日志
	 * @param name
	 */
	getLogger(name?: string): any;
	/**
	 * 获得核心日志
	 */
	getCoreLogger(): any;
	/**
	 * 创建日志
	 * @param name
	 * @param options
	 */
	createLogger(name: string, options: any): any;
	/**
	 * 获得当前应用名称
	 */
	getProjectName(): string;
	/**
	 * 创建一个带有RequestContainer的上下文
	 * @param args 参数
	 */
	createAnonymousContext(...args: any[]): any;
	/**
	 * 创建一个带有RequestContainer的上下文
	 * @param BaseContextLoggerClass 上下文日志类
	 */
	setContextLoggerClass(BaseContextLoggerClass: any): void;
	/**
	 * 新增配置
	 * @param obj 配置对象
	 */
	addConfigObject(obj: any): any;
	/**
	 * 设置属性
	 * @param key 属性名
	 * @param value 属性值
	 */
	setAttr(key: string, value: any): any;
	/**
	 * 获得属性
	 * @param key
	 */
	getAttr<T>(key: string): T;
	/**
	 * 使用中间件
	 * @param Middleware
	 */
	useMiddleware<R, N>(Middleware): void;
	/**
	 * 获得中间件
	 */
	getMiddleware<R, N>(): any;
	/**
	 * 使用过滤器
	 * @param Filter 过滤器
	 */
	useFilter<R, N>(Filter): void;
	/**
	 * 新增全局守卫
	 * @param guard
	 */
	useGuard(guard): void;
	/**
	 * 获得命名空间
	 */
	getNamespace(): string;

	[key: string]: any;
}

/**
 * OrmManager
 */
interface OrmManager {
	/**
	 * 获得数据源
	 * @param dataSourceName
	 */
	getDataSource(dataSourceName: string): any;
	/**
	 * 检查数据源是否存在
	 * @param dataSourceName
	 */
	hasDataSource(dataSourceName: string): boolean;
	/**
	 * 获得所有数据源名称
	 */
	getDataSourceNames(): string[];
	/**
	 * 获得所有数据源
	 */
	getAllDataSources(): Map<string, any>;
	/**
	 * 检查数据源是否连接
	 * @param dataSourceName
	 */
	isConnected(dataSourceName: string): Promise<boolean>;
	/**
	 * 创建数据源实例
	 * @param config
	 * @param clientName
	 * @param options
	 */
	createInstance(
		config: any,
		clientName: any,
		options?: {
			validateConnection?: boolean;
			cacheInstance?: boolean | undefined;
		}
	): Promise<any>;
	/**
	 * 获得model或者repository的数据源名称
	 * @param modelOrRepository
	 */
	getDataSourceNameByModel(modelOrRepository: any): string | undefined;
	/**
	 * 获得名称
	 */
	getName(): string;
	/**
	 * 停止
	 */
	stop(): Promise<void>;
	/**
	 * 获得默认数据源名称
	 */
	getDefaultDataSourceName(): string;
	/**
	 * 获得数据源优先级
	 * @param name
	 */
	getDataSourcePriority(name: string): string;
	/**
	 * 是否高优先级
	 * @param name
	 */
	isHighPriority(name: string): boolean;
	/**
	 * 是否中等优先级
	 * @param
	 */
	isMediumPriority(name: string): boolean;
	/**
	 * 是否低优先级
	 * @param name
	 */
	isLowPriority(name: string): boolean;

	[key: string]: any;
}

/**
 * PluginService
 */
interface PluginService {
	/**
	 * 获得插件配置
	 * @param key 插件key
	 */
	getConfig(key: string): Promise<any>;
	/**
	 * 调用插件
	 * @param key 插件key
	 * @param method 方法
	 * @param params 参数
	 * @returns
	 */
	invoke(key: string, method: string, ...params: any[]): Promise<any>;
	/**
	 * 获得插件实例
	 * @param key 插件key
	 * @returns
	 */
	getInstance(key: string): Promise<any>;

	[key: string]: any;
}

/**
 * MidwayCache
 */
interface MidwayCache {
	/**
	 * 设置缓存
	 * @param key
	 * @param value
	 * @param ttl
	 * @returns
	 */
	set: (key: string, value: unknown, ttl?: number) => Promise<void>;
	/**
	 * 获得缓存
	 * @param key
	 * @returns
	 */
	get: <T>(key: string) => Promise<T | undefined>;
	/**
	 * 删除缓存
	 * @param key
	 * @returns
	 */
	del: (key: string) => Promise<void>;
	/**
	 * 重置缓存
	 * @returns
	 */
	reset: () => Promise<void>;

	[key: string]: any;
}

/**
 * 代码执行基类
 */

declare class Base {
	/**
	 * 数据源管理器
	 */
	typeORMDataSourceManager: OrmManager;

	/**
	 * 应用
	 */
	app: App;
	/**
	 * 插件服务
	 */
	pluginService: PluginService;

	/**
	 * 缓存
	 */
	cache: MidwayCache;

	/**
	 * 主函数
	 */
	main(params: any): Promise<any>;

	/**
	 * 执行sql
	 * @param sql sql语句
	 * @param params 参数
	 * @param dataSource 数据源
	 */
	execSql(sql: string, params, dataSource): Promise<any>;

	/**
	 * 获得typeorm的Repository
	 * @param anyName
	 * @returns
	 */
	getRepository(anyName: string): Promise<Repository>;

	/**
	 * 调用service
	 * @param service 服务
	 * @param method 方法
	 * @param args 参数
	 * @returns
	 */
	invokeService(service: string, method: string, ...args): Promise<any>;

	/**
	 * 调用插件
	 * @param key 插件的key
	 * @param method 插件的方法
	 * @param args 参数
	 * @returns
	 */
	invokePlugin(key: string, method: string, ...args): Promise<any>;
}
`;
