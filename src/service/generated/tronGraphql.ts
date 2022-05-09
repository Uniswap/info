export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
}

export type RootQuery = {
  __typename?: 'RootQuery'
  token?: Maybe<Token>
  tokens_collection?: Maybe<TokenCollection>
  whiteSwapDayDatas?: Maybe<Array<Maybe<WhiteSwapDayData>>>
}

export type RootQueryTokenArgs = {
  id?: InputMaybe<Scalars['Int']>
}

export type RootQueryWhiteSwapDayDatasArgs = {
  startTime?: InputMaybe<Scalars['Int']>
}

/** Crypto token */
export type Token = {
  __typename?: 'Token'
  /** Token address */
  address?: Maybe<Scalars['String']>
  /** Token code */
  code?: Maybe<Scalars['String']>
  /** Token id */
  id?: Maybe<Scalars['Int']>
  /** Token name */
  name?: Maybe<Scalars['String']>
}

/** Tokens list */
export type TokenCollection = {
  __typename?: 'TokenCollection'
  /** tokens list */
  tokens?: Maybe<Array<Maybe<Token>>>
}

/** WhiteSwapDayData for Graph */
export type WhiteSwapDayData = {
  __typename?: 'WhiteSwapDayData'
  /** Data dailyVolumeUSD */
  dailyVolumeUSD?: Maybe<Scalars['String']>
  /** Data date */
  date?: Maybe<Scalars['Int']>
  /** Data totalLiquidityUSD */
  totalLiquidityUSD?: Maybe<Scalars['String']>
}

export type GlobalChartQueryVariables = Exact<{
  startTime: Scalars['Int']
}>

export type GlobalChartQuery = {
  __typename?: 'RootQuery'
  whiteSwapDayDatas?: Array<{
    __typename?: 'WhiteSwapDayData'
    date?: number | null
    dailyVolumeUSD?: string | null
    totalLiquidityUSD?: string | null
  } | null> | null
}
