import { promises as fs } from 'fs'
import path from 'path'

import { lazy, object, string } from 'yup'

import { Merge } from '../utils/typeUtils'

import { JWT } from './JWT'
import { mapRuleToKeys } from './ext/yup'

export class AccountManager {
  private static accountsFilename = 'logi-circle-controls-accounts.json'

  private get accountsFilePath(): string {
    return path.join(this.homebridgeDir, AccountManager.accountsFilename)
  }

  constructor(private readonly homebridgeDir: string) {}

  async getAllAccounts(): Promise<Accounts> {
    const accounts = await this.readAccountsFile()

    return Object.entries(accounts).reduce<Accounts>(
      (result, next) => ({
        ...result,
        [next[0]]: {
          ...next[1],
          accessToken: new JWT(next[1].accessToken),
        },
      }),
      {},
    )
  }

  async getAccount(userId: string): Promise<AccountInfo | undefined> {
    return (await this.getAllAccounts())[userId]
  }

  async setAccount(id: string, details: AccountInfo): Promise<void> {
    const accounts = await this.readAccountsFile()
    accounts[id] = {
      ...details,
      accessToken: details.accessToken.rawToken,
    }
    return this.writeAccountsFile(accounts)
  }

  private async readAccountsFile(): Promise<PersistedAccounts> {
    if (!(await fs.stat(this.homebridgeDir)).isDirectory()) {
      throw new Error(
        `Homebridge path '${this.homebridgeDir}' must be a directory`,
      )
    }

    let fileContents: string

    try {
      fileContents = (await fs.readFile(this.accountsFilePath)).toString()
    } catch {
      fileContents = '{}'
    }

    return accountsSchema.validate(JSON.parse(fileContents.toString()))
  }

  private async writeAccountsFile(accounts: PersistedAccounts): Promise<void> {
    return fs.writeFile(
      this.accountsFilePath,
      JSON.stringify(accounts, undefined, 2),
    )
  }
}

const accountsSchema = lazy(obj =>
  object(
    mapRuleToKeys(
      obj,
      object({
        accessToken: string().required(),
        codeVerifier: string().required(),
        refreshToken: string().required(),
      }).required(),
    ),
  ).required(),
)

type Accounts = Record<string, AccountInfo>

export interface AccountInfo {
  accessToken: JWT
  codeVerifier: string
  refreshToken: string
}

type PersistedAccounts = Record<string, PersistedAccountInfo>

type PersistedAccountInfo = Merge<
  AccountInfo,
  {
    accessToken: string
  }
>
