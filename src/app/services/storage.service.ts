import {Report} from "../models/report.model";
import {Injectable} from "@angular/core";
import {Observable} from "rxjs";

export type Game = { id?: string, name: string, year: number };

@Injectable()
export abstract class StorageService {
  getGames(): Observable<Array<Game>> {
    throw new Error("Method not implemented.");
  }

  getReports(): Observable<Array<Report>> {
    throw new Error("Method not implemented.");
  }

  getReport(id: number): Observable<Report | undefined> {
    throw new Error("Method not implemented.");
  }

  deleteReport(id: number): Observable<void> {
    throw new Error("Method not implemented.");
  }

  setReports(reports: Array<Report>): Observable<void> {
    throw new Error("Method not implemented.");
  }

  addOrUpdateReport(report: Report): Observable<void> {
    throw new Error("Method not implemented.");
  }
}
