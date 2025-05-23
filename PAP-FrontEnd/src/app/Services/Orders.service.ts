import { inject, Injectable, signal } from '@angular/core';
import SimpleCache from '../../../../shared/SimpleCache';
import { AppSettings } from './AppSettings';
import { HttpService } from './Http.service';
import { Table } from '../../../../shared/table';

@Injectable({
  providedIn: 'root'
})

export class OrdersService {
  HttpService = inject(HttpService)

  Tables = new SimpleCache(async () => {
    const [Tables] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'tables')

    const ConvertedTables = Object.fromEntries(
      Tables.map((Table: any) => {
        Table.created_at = new Date(Table.created_at)
        Table.time = Date.now() - Table.created_at.getTime()
        return [Table.tableid, Table]
      })
    )

    return ConvertedTables
  }, 10)

  TablesTimer: any

  
  constructor() {
    this.TablesTimer = setInterval(() => {
      for (const Table of Object.values(this.Tables.CachedData as Table[])) {
        Table.time = Date.now() - Table.created_at.getTime()
      }
    }, 1000)
  }

  Teste = false
}
