import { Injectable } from '@nestjs/common'
import convict, { Config, Path } from 'convict'
import { GetParametersByPathCommand, SSMClient } from '@aws-sdk/client-ssm'
import fs from 'fs'
import dotenv = require('dotenv')

import { ConfigSchema, schema } from '../config.schema'

@Injectable()
export class ConfigService {
  config: Config<ConfigSchema>
  constructor() {
    dotenv.config()
    this.config = convict(schema)
    this.config.validate()
  }

  // We want to implicitly use the return type of convict get method.
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  get<K extends Path<ConfigSchema>>(key: K) {
    return this.config.get(key)
  }

  get isDevEnv(): boolean {
    return this.config.get('environment') === 'development'
  }

  /**
   * This function calls systems manager and generates a .env file based on the environment you are in.
   * The default prefix path will be for the environment variable will be /${ENV}-checkwho-gov followed by the environment key
   * Example:
   *  A parameter with the file path on SSM /staging-checkwho-gov/DB_NAME will be echoed to .env file with the format DB_NAME={}
   * @param {string=/${ENV}-checkwho-gov/} prefix: Prefix file path to search param by in SSM
   */
  static async createEnvFileFromSystemsManager(prefix?: string) {
    dotenv.config()
    const client = new SSMClient({ region: 'ap-southeast-1' })
    console.log({
      message: 'Initializing config for',
      environment: process.env.ENV,
    })
    const ENV = process.env.ENV ?? 'staging'
    const filePathPrefix = prefix ?? `/${ENV}-checkwho-gov/`
    const params: Record<string, string> = {}
    let nextToken

    do {
      // Handle pagination (max 10 params per call)
      const res: any = await client.send(
        new GetParametersByPathCommand({
          Path: filePathPrefix,
          Recursive: true,
          WithDecryption: true,
          ...(nextToken ? { NextToken: nextToken } : {}),
        }),
      )

      for (const parameter of res.Parameters ?? []) {
        const paramName = parameter.Name.slice(filePathPrefix.length)
        const isStringList = parameter.Type === 'StringList'
        params[paramName] = isStringList
          ? `[${parameter.Value.split(',').map((x: string) => `"${x}"`)}]`
          : parameter.Value
      }

      nextToken = res.NextToken
    } while (nextToken)

    // format strings, JSON strings, and StringList appropriately
    const envString = Object.entries(params)
      .map(([k, v]) => {
        const strippedValue = v.replace(/\s/g, '')
        const looksLikeJson = strippedValue.includes('{')
        return looksLikeJson
          ? `${k}=${strippedValue}`
          : `${k}='${strippedValue}'`
      })
      .join('\n')
      .concat(`\nNODE_ENV=${ENV}`)

    console.log({
      message: 'Succesfully fetched environment variables from SSM',
      keys: Object.keys(params),
    })

    await fs.promises.writeFile('.env', envString)
  }
}
