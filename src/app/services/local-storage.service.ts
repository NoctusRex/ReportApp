import {Injectable} from "@angular/core";
import {Report} from "../models/report.model";
import {Game, StorageService} from "./storage.service";
import {concatMap, map, Observable, of} from "rxjs";

@Injectable()
export class LocalStorageService extends StorageService {
  REPORT_KEY = "DMMIB_REPORTS_REPORTS";

  override getGames(): Observable<Array<Game>> {
    return of([
      {year: 2025, name: "3 Chapters"},
      {year: 2025, name: "Die Blumenstraße"},
      {year: 2025, name: "Funkenschlag: Outpost"},
      {year: 2025, name: "Rajas of the Ganges: Cards & Karma"}
    ]);
  }

  override getReports(): Observable<Array<Report>> {
    const json = localStorage.getItem(this.REPORT_KEY);
    if (!json) return of([]);

    return of(JSON.parse(json));
  }

  override getReport(id: number): Observable<Report | undefined> {
    return this.getReports().pipe(map(reports => reports.find(x => Number(x.id) === Number(id))));
  }

  override deleteReport(id: number): Observable<void> {
    return this.getReports().pipe(
      map(reports => reports.filter(item => item.id !== id)),
      concatMap(reports => this.setReports(reports))
    );
  }

  override setReports(reports: Array<Report>): Observable<void> {
    localStorage.setItem(this.REPORT_KEY, JSON.stringify(reports));

    return of(undefined);
  }

  override addOrUpdateReport(report: Report): Observable<void> {
    return this.getReports().pipe(
      map(reports => {
        let existing = reports.find(x => Number(x.id) === Number(report.id));

        if (existing) {
          existing.id = Number(report.id);
          existing.year = Number(report.year);
          existing.solution = report.solution;
          existing.game = report.game;
          existing.judges = report.judges;
          existing.problem = report.problem;
          existing.persons = report.persons;
        } else {
          report.id = Math.max(Math.max(...reports.map(x => Number(x.id))) + 1, 1);
          reports.push(report);
        }

        this.setReports(reports);

        return undefined;
      })
    );
  }

}
