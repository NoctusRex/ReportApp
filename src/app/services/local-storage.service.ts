import {Injectable} from "@angular/core";
import {Report} from "../models/report.model";

@Injectable({providedIn: 'root'})
export class LocalStorageService {
  getGames(year?: number): Array<string> {
    const g = [
      {year: 2025, name: "3 Chapters"},
      {year: 2025, name: "Die Blumenstraße"},
      {year: 2025, name: "Funkenschlag: Outpost"},
      {year: 2025, name: "Rajas of the Ganges: Cards & Karma"}];

    if (year) {
      return g.filter(x => x.year === year).map(x => x.name);
    }

    return g.map(x => x.name);
  }

  getReports(): Array<Report> {
    const json = localStorage.getItem(this.REPORT_KEY);
    if (!json) return [];

    return JSON.parse(json);
  }

  getReport(id: number): Report | undefined {
    return this.getReports().find(x => Number(x.id) === Number(id));
  }

  setReports(reports: Array<Report>): void {
    localStorage.setItem(this.REPORT_KEY, JSON.stringify(reports));
  }

  addOrUpdateReport(report: Report): void {
    const reports = this.getReports();
    let existing = reports.find(x => Number(x.id) === Number(report.id));

    console.warn("addOrUpdate", {reports, report: {...report}, existing});

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
  }
}
