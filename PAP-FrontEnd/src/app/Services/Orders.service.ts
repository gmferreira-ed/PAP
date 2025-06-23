import { inject, Injectable, signal } from '@angular/core';
import SimpleCache from '../../shared/SimpleCache';
import { AppSettings } from './AppSettings';
import { HttpService } from './Http.service';
import { Table } from '../../shared/table';

@Injectable({
  providedIn: 'root'
})

export class OrdersService {
  HttpService = inject(HttpService)

  LoadingTables = false

  Reservations = new SimpleCache(async (): Promise<Map<string, any>> => {
    const [Reservations] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'reservations')

    const ReservationsMap = new Map()

    if (Reservations) {
      for (const Reservation of Reservations) {
        const ReservationDateTime = new Date(Reservation.date)
        Reservation.date = ReservationDateTime

        var ReservationDate: Date | string = new Date(ReservationDateTime)
        ReservationDate.setHours(0, 0, 0, 0)
        ReservationDate = ReservationDate.toISOString()


        let ReservationsInDay = ReservationsMap.get(ReservationDate)
        if (!ReservationsInDay) {
          ReservationsInDay = {}
          ReservationsMap.set(ReservationDate, ReservationsInDay)
        }

        ReservationsInDay.push(Reservation)
      }
    }

    console.log(ReservationsMap)
    return ReservationsMap
  }, 10)

  // Fetching tables
  Tables = new SimpleCache(async () => {
    this.LoadingTables = true

    const [Tables] = await this.HttpService.MakeRequest(AppSettings.APIUrl + 'tables')

    const ConvertedTables = Object.fromEntries(
      Tables.map((Table: any) => {
        Table.created_at = new Date(Table.created_at)
        Table.time = Date.now() - Table.created_at.getTime()
        return [Table.tableid, Table]
      })
    )

    this.LoadingTables = false
    return ConvertedTables
  }, 10)



  // Tables remaining time timer
  TablesTimer: any
  constructor() {
    this.TablesTimer = setInterval(() => {
      if (this.Tables.CachedData) {
        for (const Table of Object.values(this.Tables.CachedData as Table[])) {
          Table.time = Date.now() - Table.created_at.getTime()
        }
      }
    }, 1000)
  }

  Teste = false
}
