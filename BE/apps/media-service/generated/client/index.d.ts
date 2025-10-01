
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model MediaFile
 * 
 */
export type MediaFile = $Result.DefaultSelection<Prisma.$MediaFilePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const UploaderType: {
  PARENT: 'PARENT',
  CHILD: 'CHILD'
};

export type UploaderType = (typeof UploaderType)[keyof typeof UploaderType]

}

export type UploaderType = $Enums.UploaderType

export const UploaderType: typeof $Enums.UploaderType

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more MediaFiles
 * const mediaFiles = await prisma.mediaFile.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more MediaFiles
   * const mediaFiles = await prisma.mediaFile.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.mediaFile`: Exposes CRUD operations for the **MediaFile** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MediaFiles
    * const mediaFiles = await prisma.mediaFile.findMany()
    * ```
    */
  get mediaFile(): Prisma.MediaFileDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.16.1
   * Query Engine version: 1c57fdcd7e44b29b9313256c76699e91c3ac3c43
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    MediaFile: 'MediaFile'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "mediaFile"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      MediaFile: {
        payload: Prisma.$MediaFilePayload<ExtArgs>
        fields: Prisma.MediaFileFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MediaFileFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MediaFilePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MediaFileFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MediaFilePayload>
          }
          findFirst: {
            args: Prisma.MediaFileFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MediaFilePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MediaFileFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MediaFilePayload>
          }
          findMany: {
            args: Prisma.MediaFileFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MediaFilePayload>[]
          }
          create: {
            args: Prisma.MediaFileCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MediaFilePayload>
          }
          createMany: {
            args: Prisma.MediaFileCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MediaFileCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MediaFilePayload>[]
          }
          delete: {
            args: Prisma.MediaFileDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MediaFilePayload>
          }
          update: {
            args: Prisma.MediaFileUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MediaFilePayload>
          }
          deleteMany: {
            args: Prisma.MediaFileDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MediaFileUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.MediaFileUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MediaFilePayload>[]
          }
          upsert: {
            args: Prisma.MediaFileUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MediaFilePayload>
          }
          aggregate: {
            args: Prisma.MediaFileAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMediaFile>
          }
          groupBy: {
            args: Prisma.MediaFileGroupByArgs<ExtArgs>
            result: $Utils.Optional<MediaFileGroupByOutputType>[]
          }
          count: {
            args: Prisma.MediaFileCountArgs<ExtArgs>
            result: $Utils.Optional<MediaFileCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory | null
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    mediaFile?: MediaFileOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model MediaFile
   */

  export type AggregateMediaFile = {
    _count: MediaFileCountAggregateOutputType | null
    _avg: MediaFileAvgAggregateOutputType | null
    _sum: MediaFileSumAggregateOutputType | null
    _min: MediaFileMinAggregateOutputType | null
    _max: MediaFileMaxAggregateOutputType | null
  }

  export type MediaFileAvgAggregateOutputType = {
    mediaId: number | null
    uploaderProfileId: number | null
    fileSize: number | null
  }

  export type MediaFileSumAggregateOutputType = {
    mediaId: bigint | null
    uploaderProfileId: bigint | null
    fileSize: bigint | null
  }

  export type MediaFileMinAggregateOutputType = {
    mediaId: bigint | null
    uploaderProfileId: bigint | null
    uploaderType: $Enums.UploaderType | null
    fileName: string | null
    mimeType: string | null
    fileSize: bigint | null
    s3Key: string | null
    cdnUrl: string | null
    createdAt: Date | null
  }

  export type MediaFileMaxAggregateOutputType = {
    mediaId: bigint | null
    uploaderProfileId: bigint | null
    uploaderType: $Enums.UploaderType | null
    fileName: string | null
    mimeType: string | null
    fileSize: bigint | null
    s3Key: string | null
    cdnUrl: string | null
    createdAt: Date | null
  }

  export type MediaFileCountAggregateOutputType = {
    mediaId: number
    uploaderProfileId: number
    uploaderType: number
    fileName: number
    mimeType: number
    fileSize: number
    s3Key: number
    cdnUrl: number
    createdAt: number
    _all: number
  }


  export type MediaFileAvgAggregateInputType = {
    mediaId?: true
    uploaderProfileId?: true
    fileSize?: true
  }

  export type MediaFileSumAggregateInputType = {
    mediaId?: true
    uploaderProfileId?: true
    fileSize?: true
  }

  export type MediaFileMinAggregateInputType = {
    mediaId?: true
    uploaderProfileId?: true
    uploaderType?: true
    fileName?: true
    mimeType?: true
    fileSize?: true
    s3Key?: true
    cdnUrl?: true
    createdAt?: true
  }

  export type MediaFileMaxAggregateInputType = {
    mediaId?: true
    uploaderProfileId?: true
    uploaderType?: true
    fileName?: true
    mimeType?: true
    fileSize?: true
    s3Key?: true
    cdnUrl?: true
    createdAt?: true
  }

  export type MediaFileCountAggregateInputType = {
    mediaId?: true
    uploaderProfileId?: true
    uploaderType?: true
    fileName?: true
    mimeType?: true
    fileSize?: true
    s3Key?: true
    cdnUrl?: true
    createdAt?: true
    _all?: true
  }

  export type MediaFileAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MediaFile to aggregate.
     */
    where?: MediaFileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MediaFiles to fetch.
     */
    orderBy?: MediaFileOrderByWithRelationInput | MediaFileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MediaFileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MediaFiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MediaFiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MediaFiles
    **/
    _count?: true | MediaFileCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: MediaFileAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: MediaFileSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MediaFileMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MediaFileMaxAggregateInputType
  }

  export type GetMediaFileAggregateType<T extends MediaFileAggregateArgs> = {
        [P in keyof T & keyof AggregateMediaFile]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMediaFile[P]>
      : GetScalarType<T[P], AggregateMediaFile[P]>
  }




  export type MediaFileGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MediaFileWhereInput
    orderBy?: MediaFileOrderByWithAggregationInput | MediaFileOrderByWithAggregationInput[]
    by: MediaFileScalarFieldEnum[] | MediaFileScalarFieldEnum
    having?: MediaFileScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MediaFileCountAggregateInputType | true
    _avg?: MediaFileAvgAggregateInputType
    _sum?: MediaFileSumAggregateInputType
    _min?: MediaFileMinAggregateInputType
    _max?: MediaFileMaxAggregateInputType
  }

  export type MediaFileGroupByOutputType = {
    mediaId: bigint
    uploaderProfileId: bigint
    uploaderType: $Enums.UploaderType
    fileName: string
    mimeType: string
    fileSize: bigint
    s3Key: string
    cdnUrl: string | null
    createdAt: Date
    _count: MediaFileCountAggregateOutputType | null
    _avg: MediaFileAvgAggregateOutputType | null
    _sum: MediaFileSumAggregateOutputType | null
    _min: MediaFileMinAggregateOutputType | null
    _max: MediaFileMaxAggregateOutputType | null
  }

  type GetMediaFileGroupByPayload<T extends MediaFileGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MediaFileGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MediaFileGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MediaFileGroupByOutputType[P]>
            : GetScalarType<T[P], MediaFileGroupByOutputType[P]>
        }
      >
    >


  export type MediaFileSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    mediaId?: boolean
    uploaderProfileId?: boolean
    uploaderType?: boolean
    fileName?: boolean
    mimeType?: boolean
    fileSize?: boolean
    s3Key?: boolean
    cdnUrl?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["mediaFile"]>

  export type MediaFileSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    mediaId?: boolean
    uploaderProfileId?: boolean
    uploaderType?: boolean
    fileName?: boolean
    mimeType?: boolean
    fileSize?: boolean
    s3Key?: boolean
    cdnUrl?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["mediaFile"]>

  export type MediaFileSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    mediaId?: boolean
    uploaderProfileId?: boolean
    uploaderType?: boolean
    fileName?: boolean
    mimeType?: boolean
    fileSize?: boolean
    s3Key?: boolean
    cdnUrl?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["mediaFile"]>

  export type MediaFileSelectScalar = {
    mediaId?: boolean
    uploaderProfileId?: boolean
    uploaderType?: boolean
    fileName?: boolean
    mimeType?: boolean
    fileSize?: boolean
    s3Key?: boolean
    cdnUrl?: boolean
    createdAt?: boolean
  }

  export type MediaFileOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"mediaId" | "uploaderProfileId" | "uploaderType" | "fileName" | "mimeType" | "fileSize" | "s3Key" | "cdnUrl" | "createdAt", ExtArgs["result"]["mediaFile"]>

  export type $MediaFilePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MediaFile"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      mediaId: bigint
      uploaderProfileId: bigint
      uploaderType: $Enums.UploaderType
      fileName: string
      mimeType: string
      fileSize: bigint
      s3Key: string
      cdnUrl: string | null
      createdAt: Date
    }, ExtArgs["result"]["mediaFile"]>
    composites: {}
  }

  type MediaFileGetPayload<S extends boolean | null | undefined | MediaFileDefaultArgs> = $Result.GetResult<Prisma.$MediaFilePayload, S>

  type MediaFileCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<MediaFileFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: MediaFileCountAggregateInputType | true
    }

  export interface MediaFileDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MediaFile'], meta: { name: 'MediaFile' } }
    /**
     * Find zero or one MediaFile that matches the filter.
     * @param {MediaFileFindUniqueArgs} args - Arguments to find a MediaFile
     * @example
     * // Get one MediaFile
     * const mediaFile = await prisma.mediaFile.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MediaFileFindUniqueArgs>(args: SelectSubset<T, MediaFileFindUniqueArgs<ExtArgs>>): Prisma__MediaFileClient<$Result.GetResult<Prisma.$MediaFilePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one MediaFile that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {MediaFileFindUniqueOrThrowArgs} args - Arguments to find a MediaFile
     * @example
     * // Get one MediaFile
     * const mediaFile = await prisma.mediaFile.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MediaFileFindUniqueOrThrowArgs>(args: SelectSubset<T, MediaFileFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MediaFileClient<$Result.GetResult<Prisma.$MediaFilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MediaFile that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MediaFileFindFirstArgs} args - Arguments to find a MediaFile
     * @example
     * // Get one MediaFile
     * const mediaFile = await prisma.mediaFile.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MediaFileFindFirstArgs>(args?: SelectSubset<T, MediaFileFindFirstArgs<ExtArgs>>): Prisma__MediaFileClient<$Result.GetResult<Prisma.$MediaFilePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first MediaFile that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MediaFileFindFirstOrThrowArgs} args - Arguments to find a MediaFile
     * @example
     * // Get one MediaFile
     * const mediaFile = await prisma.mediaFile.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MediaFileFindFirstOrThrowArgs>(args?: SelectSubset<T, MediaFileFindFirstOrThrowArgs<ExtArgs>>): Prisma__MediaFileClient<$Result.GetResult<Prisma.$MediaFilePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more MediaFiles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MediaFileFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MediaFiles
     * const mediaFiles = await prisma.mediaFile.findMany()
     * 
     * // Get first 10 MediaFiles
     * const mediaFiles = await prisma.mediaFile.findMany({ take: 10 })
     * 
     * // Only select the `mediaId`
     * const mediaFileWithMediaIdOnly = await prisma.mediaFile.findMany({ select: { mediaId: true } })
     * 
     */
    findMany<T extends MediaFileFindManyArgs>(args?: SelectSubset<T, MediaFileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MediaFilePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a MediaFile.
     * @param {MediaFileCreateArgs} args - Arguments to create a MediaFile.
     * @example
     * // Create one MediaFile
     * const MediaFile = await prisma.mediaFile.create({
     *   data: {
     *     // ... data to create a MediaFile
     *   }
     * })
     * 
     */
    create<T extends MediaFileCreateArgs>(args: SelectSubset<T, MediaFileCreateArgs<ExtArgs>>): Prisma__MediaFileClient<$Result.GetResult<Prisma.$MediaFilePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many MediaFiles.
     * @param {MediaFileCreateManyArgs} args - Arguments to create many MediaFiles.
     * @example
     * // Create many MediaFiles
     * const mediaFile = await prisma.mediaFile.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MediaFileCreateManyArgs>(args?: SelectSubset<T, MediaFileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MediaFiles and returns the data saved in the database.
     * @param {MediaFileCreateManyAndReturnArgs} args - Arguments to create many MediaFiles.
     * @example
     * // Create many MediaFiles
     * const mediaFile = await prisma.mediaFile.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MediaFiles and only return the `mediaId`
     * const mediaFileWithMediaIdOnly = await prisma.mediaFile.createManyAndReturn({
     *   select: { mediaId: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MediaFileCreateManyAndReturnArgs>(args?: SelectSubset<T, MediaFileCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MediaFilePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a MediaFile.
     * @param {MediaFileDeleteArgs} args - Arguments to delete one MediaFile.
     * @example
     * // Delete one MediaFile
     * const MediaFile = await prisma.mediaFile.delete({
     *   where: {
     *     // ... filter to delete one MediaFile
     *   }
     * })
     * 
     */
    delete<T extends MediaFileDeleteArgs>(args: SelectSubset<T, MediaFileDeleteArgs<ExtArgs>>): Prisma__MediaFileClient<$Result.GetResult<Prisma.$MediaFilePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one MediaFile.
     * @param {MediaFileUpdateArgs} args - Arguments to update one MediaFile.
     * @example
     * // Update one MediaFile
     * const mediaFile = await prisma.mediaFile.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MediaFileUpdateArgs>(args: SelectSubset<T, MediaFileUpdateArgs<ExtArgs>>): Prisma__MediaFileClient<$Result.GetResult<Prisma.$MediaFilePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more MediaFiles.
     * @param {MediaFileDeleteManyArgs} args - Arguments to filter MediaFiles to delete.
     * @example
     * // Delete a few MediaFiles
     * const { count } = await prisma.mediaFile.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MediaFileDeleteManyArgs>(args?: SelectSubset<T, MediaFileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MediaFiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MediaFileUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MediaFiles
     * const mediaFile = await prisma.mediaFile.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MediaFileUpdateManyArgs>(args: SelectSubset<T, MediaFileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MediaFiles and returns the data updated in the database.
     * @param {MediaFileUpdateManyAndReturnArgs} args - Arguments to update many MediaFiles.
     * @example
     * // Update many MediaFiles
     * const mediaFile = await prisma.mediaFile.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more MediaFiles and only return the `mediaId`
     * const mediaFileWithMediaIdOnly = await prisma.mediaFile.updateManyAndReturn({
     *   select: { mediaId: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends MediaFileUpdateManyAndReturnArgs>(args: SelectSubset<T, MediaFileUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MediaFilePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one MediaFile.
     * @param {MediaFileUpsertArgs} args - Arguments to update or create a MediaFile.
     * @example
     * // Update or create a MediaFile
     * const mediaFile = await prisma.mediaFile.upsert({
     *   create: {
     *     // ... data to create a MediaFile
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MediaFile we want to update
     *   }
     * })
     */
    upsert<T extends MediaFileUpsertArgs>(args: SelectSubset<T, MediaFileUpsertArgs<ExtArgs>>): Prisma__MediaFileClient<$Result.GetResult<Prisma.$MediaFilePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of MediaFiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MediaFileCountArgs} args - Arguments to filter MediaFiles to count.
     * @example
     * // Count the number of MediaFiles
     * const count = await prisma.mediaFile.count({
     *   where: {
     *     // ... the filter for the MediaFiles we want to count
     *   }
     * })
    **/
    count<T extends MediaFileCountArgs>(
      args?: Subset<T, MediaFileCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MediaFileCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MediaFile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MediaFileAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MediaFileAggregateArgs>(args: Subset<T, MediaFileAggregateArgs>): Prisma.PrismaPromise<GetMediaFileAggregateType<T>>

    /**
     * Group by MediaFile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MediaFileGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MediaFileGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MediaFileGroupByArgs['orderBy'] }
        : { orderBy?: MediaFileGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MediaFileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMediaFileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MediaFile model
   */
  readonly fields: MediaFileFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MediaFile.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MediaFileClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MediaFile model
   */
  interface MediaFileFieldRefs {
    readonly mediaId: FieldRef<"MediaFile", 'BigInt'>
    readonly uploaderProfileId: FieldRef<"MediaFile", 'BigInt'>
    readonly uploaderType: FieldRef<"MediaFile", 'UploaderType'>
    readonly fileName: FieldRef<"MediaFile", 'String'>
    readonly mimeType: FieldRef<"MediaFile", 'String'>
    readonly fileSize: FieldRef<"MediaFile", 'BigInt'>
    readonly s3Key: FieldRef<"MediaFile", 'String'>
    readonly cdnUrl: FieldRef<"MediaFile", 'String'>
    readonly createdAt: FieldRef<"MediaFile", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MediaFile findUnique
   */
  export type MediaFileFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MediaFile
     */
    select?: MediaFileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MediaFile
     */
    omit?: MediaFileOmit<ExtArgs> | null
    /**
     * Filter, which MediaFile to fetch.
     */
    where: MediaFileWhereUniqueInput
  }

  /**
   * MediaFile findUniqueOrThrow
   */
  export type MediaFileFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MediaFile
     */
    select?: MediaFileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MediaFile
     */
    omit?: MediaFileOmit<ExtArgs> | null
    /**
     * Filter, which MediaFile to fetch.
     */
    where: MediaFileWhereUniqueInput
  }

  /**
   * MediaFile findFirst
   */
  export type MediaFileFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MediaFile
     */
    select?: MediaFileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MediaFile
     */
    omit?: MediaFileOmit<ExtArgs> | null
    /**
     * Filter, which MediaFile to fetch.
     */
    where?: MediaFileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MediaFiles to fetch.
     */
    orderBy?: MediaFileOrderByWithRelationInput | MediaFileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MediaFiles.
     */
    cursor?: MediaFileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MediaFiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MediaFiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MediaFiles.
     */
    distinct?: MediaFileScalarFieldEnum | MediaFileScalarFieldEnum[]
  }

  /**
   * MediaFile findFirstOrThrow
   */
  export type MediaFileFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MediaFile
     */
    select?: MediaFileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MediaFile
     */
    omit?: MediaFileOmit<ExtArgs> | null
    /**
     * Filter, which MediaFile to fetch.
     */
    where?: MediaFileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MediaFiles to fetch.
     */
    orderBy?: MediaFileOrderByWithRelationInput | MediaFileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MediaFiles.
     */
    cursor?: MediaFileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MediaFiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MediaFiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MediaFiles.
     */
    distinct?: MediaFileScalarFieldEnum | MediaFileScalarFieldEnum[]
  }

  /**
   * MediaFile findMany
   */
  export type MediaFileFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MediaFile
     */
    select?: MediaFileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MediaFile
     */
    omit?: MediaFileOmit<ExtArgs> | null
    /**
     * Filter, which MediaFiles to fetch.
     */
    where?: MediaFileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MediaFiles to fetch.
     */
    orderBy?: MediaFileOrderByWithRelationInput | MediaFileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MediaFiles.
     */
    cursor?: MediaFileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MediaFiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MediaFiles.
     */
    skip?: number
    distinct?: MediaFileScalarFieldEnum | MediaFileScalarFieldEnum[]
  }

  /**
   * MediaFile create
   */
  export type MediaFileCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MediaFile
     */
    select?: MediaFileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MediaFile
     */
    omit?: MediaFileOmit<ExtArgs> | null
    /**
     * The data needed to create a MediaFile.
     */
    data: XOR<MediaFileCreateInput, MediaFileUncheckedCreateInput>
  }

  /**
   * MediaFile createMany
   */
  export type MediaFileCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MediaFiles.
     */
    data: MediaFileCreateManyInput | MediaFileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MediaFile createManyAndReturn
   */
  export type MediaFileCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MediaFile
     */
    select?: MediaFileSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MediaFile
     */
    omit?: MediaFileOmit<ExtArgs> | null
    /**
     * The data used to create many MediaFiles.
     */
    data: MediaFileCreateManyInput | MediaFileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MediaFile update
   */
  export type MediaFileUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MediaFile
     */
    select?: MediaFileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MediaFile
     */
    omit?: MediaFileOmit<ExtArgs> | null
    /**
     * The data needed to update a MediaFile.
     */
    data: XOR<MediaFileUpdateInput, MediaFileUncheckedUpdateInput>
    /**
     * Choose, which MediaFile to update.
     */
    where: MediaFileWhereUniqueInput
  }

  /**
   * MediaFile updateMany
   */
  export type MediaFileUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MediaFiles.
     */
    data: XOR<MediaFileUpdateManyMutationInput, MediaFileUncheckedUpdateManyInput>
    /**
     * Filter which MediaFiles to update
     */
    where?: MediaFileWhereInput
    /**
     * Limit how many MediaFiles to update.
     */
    limit?: number
  }

  /**
   * MediaFile updateManyAndReturn
   */
  export type MediaFileUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MediaFile
     */
    select?: MediaFileSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the MediaFile
     */
    omit?: MediaFileOmit<ExtArgs> | null
    /**
     * The data used to update MediaFiles.
     */
    data: XOR<MediaFileUpdateManyMutationInput, MediaFileUncheckedUpdateManyInput>
    /**
     * Filter which MediaFiles to update
     */
    where?: MediaFileWhereInput
    /**
     * Limit how many MediaFiles to update.
     */
    limit?: number
  }

  /**
   * MediaFile upsert
   */
  export type MediaFileUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MediaFile
     */
    select?: MediaFileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MediaFile
     */
    omit?: MediaFileOmit<ExtArgs> | null
    /**
     * The filter to search for the MediaFile to update in case it exists.
     */
    where: MediaFileWhereUniqueInput
    /**
     * In case the MediaFile found by the `where` argument doesn't exist, create a new MediaFile with this data.
     */
    create: XOR<MediaFileCreateInput, MediaFileUncheckedCreateInput>
    /**
     * In case the MediaFile was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MediaFileUpdateInput, MediaFileUncheckedUpdateInput>
  }

  /**
   * MediaFile delete
   */
  export type MediaFileDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MediaFile
     */
    select?: MediaFileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MediaFile
     */
    omit?: MediaFileOmit<ExtArgs> | null
    /**
     * Filter which MediaFile to delete.
     */
    where: MediaFileWhereUniqueInput
  }

  /**
   * MediaFile deleteMany
   */
  export type MediaFileDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MediaFiles to delete
     */
    where?: MediaFileWhereInput
    /**
     * Limit how many MediaFiles to delete.
     */
    limit?: number
  }

  /**
   * MediaFile without action
   */
  export type MediaFileDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MediaFile
     */
    select?: MediaFileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the MediaFile
     */
    omit?: MediaFileOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const MediaFileScalarFieldEnum: {
    mediaId: 'mediaId',
    uploaderProfileId: 'uploaderProfileId',
    uploaderType: 'uploaderType',
    fileName: 'fileName',
    mimeType: 'mimeType',
    fileSize: 'fileSize',
    s3Key: 's3Key',
    cdnUrl: 'cdnUrl',
    createdAt: 'createdAt'
  };

  export type MediaFileScalarFieldEnum = (typeof MediaFileScalarFieldEnum)[keyof typeof MediaFileScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'BigInt'
   */
  export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>
    


  /**
   * Reference to a field of type 'BigInt[]'
   */
  export type ListBigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt[]'>
    


  /**
   * Reference to a field of type 'UploaderType'
   */
  export type EnumUploaderTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UploaderType'>
    


  /**
   * Reference to a field of type 'UploaderType[]'
   */
  export type ListEnumUploaderTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'UploaderType[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type MediaFileWhereInput = {
    AND?: MediaFileWhereInput | MediaFileWhereInput[]
    OR?: MediaFileWhereInput[]
    NOT?: MediaFileWhereInput | MediaFileWhereInput[]
    mediaId?: BigIntFilter<"MediaFile"> | bigint | number
    uploaderProfileId?: BigIntFilter<"MediaFile"> | bigint | number
    uploaderType?: EnumUploaderTypeFilter<"MediaFile"> | $Enums.UploaderType
    fileName?: StringFilter<"MediaFile"> | string
    mimeType?: StringFilter<"MediaFile"> | string
    fileSize?: BigIntFilter<"MediaFile"> | bigint | number
    s3Key?: StringFilter<"MediaFile"> | string
    cdnUrl?: StringNullableFilter<"MediaFile"> | string | null
    createdAt?: DateTimeFilter<"MediaFile"> | Date | string
  }

  export type MediaFileOrderByWithRelationInput = {
    mediaId?: SortOrder
    uploaderProfileId?: SortOrder
    uploaderType?: SortOrder
    fileName?: SortOrder
    mimeType?: SortOrder
    fileSize?: SortOrder
    s3Key?: SortOrder
    cdnUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type MediaFileWhereUniqueInput = Prisma.AtLeast<{
    mediaId?: bigint | number
    AND?: MediaFileWhereInput | MediaFileWhereInput[]
    OR?: MediaFileWhereInput[]
    NOT?: MediaFileWhereInput | MediaFileWhereInput[]
    uploaderProfileId?: BigIntFilter<"MediaFile"> | bigint | number
    uploaderType?: EnumUploaderTypeFilter<"MediaFile"> | $Enums.UploaderType
    fileName?: StringFilter<"MediaFile"> | string
    mimeType?: StringFilter<"MediaFile"> | string
    fileSize?: BigIntFilter<"MediaFile"> | bigint | number
    s3Key?: StringFilter<"MediaFile"> | string
    cdnUrl?: StringNullableFilter<"MediaFile"> | string | null
    createdAt?: DateTimeFilter<"MediaFile"> | Date | string
  }, "mediaId">

  export type MediaFileOrderByWithAggregationInput = {
    mediaId?: SortOrder
    uploaderProfileId?: SortOrder
    uploaderType?: SortOrder
    fileName?: SortOrder
    mimeType?: SortOrder
    fileSize?: SortOrder
    s3Key?: SortOrder
    cdnUrl?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: MediaFileCountOrderByAggregateInput
    _avg?: MediaFileAvgOrderByAggregateInput
    _max?: MediaFileMaxOrderByAggregateInput
    _min?: MediaFileMinOrderByAggregateInput
    _sum?: MediaFileSumOrderByAggregateInput
  }

  export type MediaFileScalarWhereWithAggregatesInput = {
    AND?: MediaFileScalarWhereWithAggregatesInput | MediaFileScalarWhereWithAggregatesInput[]
    OR?: MediaFileScalarWhereWithAggregatesInput[]
    NOT?: MediaFileScalarWhereWithAggregatesInput | MediaFileScalarWhereWithAggregatesInput[]
    mediaId?: BigIntWithAggregatesFilter<"MediaFile"> | bigint | number
    uploaderProfileId?: BigIntWithAggregatesFilter<"MediaFile"> | bigint | number
    uploaderType?: EnumUploaderTypeWithAggregatesFilter<"MediaFile"> | $Enums.UploaderType
    fileName?: StringWithAggregatesFilter<"MediaFile"> | string
    mimeType?: StringWithAggregatesFilter<"MediaFile"> | string
    fileSize?: BigIntWithAggregatesFilter<"MediaFile"> | bigint | number
    s3Key?: StringWithAggregatesFilter<"MediaFile"> | string
    cdnUrl?: StringNullableWithAggregatesFilter<"MediaFile"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"MediaFile"> | Date | string
  }

  export type MediaFileCreateInput = {
    mediaId?: bigint | number
    uploaderProfileId: bigint | number
    uploaderType: $Enums.UploaderType
    fileName: string
    mimeType: string
    fileSize: bigint | number
    s3Key: string
    cdnUrl?: string | null
    createdAt?: Date | string
  }

  export type MediaFileUncheckedCreateInput = {
    mediaId?: bigint | number
    uploaderProfileId: bigint | number
    uploaderType: $Enums.UploaderType
    fileName: string
    mimeType: string
    fileSize: bigint | number
    s3Key: string
    cdnUrl?: string | null
    createdAt?: Date | string
  }

  export type MediaFileUpdateInput = {
    mediaId?: BigIntFieldUpdateOperationsInput | bigint | number
    uploaderProfileId?: BigIntFieldUpdateOperationsInput | bigint | number
    uploaderType?: EnumUploaderTypeFieldUpdateOperationsInput | $Enums.UploaderType
    fileName?: StringFieldUpdateOperationsInput | string
    mimeType?: StringFieldUpdateOperationsInput | string
    fileSize?: BigIntFieldUpdateOperationsInput | bigint | number
    s3Key?: StringFieldUpdateOperationsInput | string
    cdnUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MediaFileUncheckedUpdateInput = {
    mediaId?: BigIntFieldUpdateOperationsInput | bigint | number
    uploaderProfileId?: BigIntFieldUpdateOperationsInput | bigint | number
    uploaderType?: EnumUploaderTypeFieldUpdateOperationsInput | $Enums.UploaderType
    fileName?: StringFieldUpdateOperationsInput | string
    mimeType?: StringFieldUpdateOperationsInput | string
    fileSize?: BigIntFieldUpdateOperationsInput | bigint | number
    s3Key?: StringFieldUpdateOperationsInput | string
    cdnUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MediaFileCreateManyInput = {
    mediaId?: bigint | number
    uploaderProfileId: bigint | number
    uploaderType: $Enums.UploaderType
    fileName: string
    mimeType: string
    fileSize: bigint | number
    s3Key: string
    cdnUrl?: string | null
    createdAt?: Date | string
  }

  export type MediaFileUpdateManyMutationInput = {
    mediaId?: BigIntFieldUpdateOperationsInput | bigint | number
    uploaderProfileId?: BigIntFieldUpdateOperationsInput | bigint | number
    uploaderType?: EnumUploaderTypeFieldUpdateOperationsInput | $Enums.UploaderType
    fileName?: StringFieldUpdateOperationsInput | string
    mimeType?: StringFieldUpdateOperationsInput | string
    fileSize?: BigIntFieldUpdateOperationsInput | bigint | number
    s3Key?: StringFieldUpdateOperationsInput | string
    cdnUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MediaFileUncheckedUpdateManyInput = {
    mediaId?: BigIntFieldUpdateOperationsInput | bigint | number
    uploaderProfileId?: BigIntFieldUpdateOperationsInput | bigint | number
    uploaderType?: EnumUploaderTypeFieldUpdateOperationsInput | $Enums.UploaderType
    fileName?: StringFieldUpdateOperationsInput | string
    mimeType?: StringFieldUpdateOperationsInput | string
    fileSize?: BigIntFieldUpdateOperationsInput | bigint | number
    s3Key?: StringFieldUpdateOperationsInput | string
    cdnUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type BigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type EnumUploaderTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.UploaderType | EnumUploaderTypeFieldRefInput<$PrismaModel>
    in?: $Enums.UploaderType[] | ListEnumUploaderTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.UploaderType[] | ListEnumUploaderTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumUploaderTypeFilter<$PrismaModel> | $Enums.UploaderType
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type MediaFileCountOrderByAggregateInput = {
    mediaId?: SortOrder
    uploaderProfileId?: SortOrder
    uploaderType?: SortOrder
    fileName?: SortOrder
    mimeType?: SortOrder
    fileSize?: SortOrder
    s3Key?: SortOrder
    cdnUrl?: SortOrder
    createdAt?: SortOrder
  }

  export type MediaFileAvgOrderByAggregateInput = {
    mediaId?: SortOrder
    uploaderProfileId?: SortOrder
    fileSize?: SortOrder
  }

  export type MediaFileMaxOrderByAggregateInput = {
    mediaId?: SortOrder
    uploaderProfileId?: SortOrder
    uploaderType?: SortOrder
    fileName?: SortOrder
    mimeType?: SortOrder
    fileSize?: SortOrder
    s3Key?: SortOrder
    cdnUrl?: SortOrder
    createdAt?: SortOrder
  }

  export type MediaFileMinOrderByAggregateInput = {
    mediaId?: SortOrder
    uploaderProfileId?: SortOrder
    uploaderType?: SortOrder
    fileName?: SortOrder
    mimeType?: SortOrder
    fileSize?: SortOrder
    s3Key?: SortOrder
    cdnUrl?: SortOrder
    createdAt?: SortOrder
  }

  export type MediaFileSumOrderByAggregateInput = {
    mediaId?: SortOrder
    uploaderProfileId?: SortOrder
    fileSize?: SortOrder
  }

  export type BigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type EnumUploaderTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UploaderType | EnumUploaderTypeFieldRefInput<$PrismaModel>
    in?: $Enums.UploaderType[] | ListEnumUploaderTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.UploaderType[] | ListEnumUploaderTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumUploaderTypeWithAggregatesFilter<$PrismaModel> | $Enums.UploaderType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUploaderTypeFilter<$PrismaModel>
    _max?: NestedEnumUploaderTypeFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type BigIntFieldUpdateOperationsInput = {
    set?: bigint | number
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type EnumUploaderTypeFieldUpdateOperationsInput = {
    set?: $Enums.UploaderType
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NestedBigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type NestedEnumUploaderTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.UploaderType | EnumUploaderTypeFieldRefInput<$PrismaModel>
    in?: $Enums.UploaderType[] | ListEnumUploaderTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.UploaderType[] | ListEnumUploaderTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumUploaderTypeFilter<$PrismaModel> | $Enums.UploaderType
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedBigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedEnumUploaderTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.UploaderType | EnumUploaderTypeFieldRefInput<$PrismaModel>
    in?: $Enums.UploaderType[] | ListEnumUploaderTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.UploaderType[] | ListEnumUploaderTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumUploaderTypeWithAggregatesFilter<$PrismaModel> | $Enums.UploaderType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumUploaderTypeFilter<$PrismaModel>
    _max?: NestedEnumUploaderTypeFilter<$PrismaModel>
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}