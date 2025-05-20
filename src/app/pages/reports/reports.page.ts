import {Component, signal} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {IonicModule, ViewDidEnter} from "@ionic/angular";
import {Report} from "../../models/report.model";
import {ActionSheetService} from "../../services/action-sheet.service";
import {Router} from "@angular/router";
import {LocalStorageService} from "../../services/local-storage.service";


@Component({
  selector: 'app-reports',
  templateUrl: './reports.page.html',
  styleUrls: ['./reports.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  standalone: true
})
export class ReportsPage implements ViewDidEnter {
  data = signal([] as Array<Report>);

  constructor(private actionSheet: ActionSheetService, private router: Router, private storageService: LocalStorageService) {
  }

  ionViewDidEnter(): void {
    this.data.set(this.storageService.getReports());
  }

  async open(report: Report): Promise<void> {
    await this.router.navigate(["report", report.id]);
  }

  async add(): Promise<void> {
    await this.router.navigate(["report"]);
  }

  delete(report: Report): void {
    this.actionSheet.show("Should the report be deleted?", [
      {
        text: 'Yes, delete the report.',
        role: "yes"
      },
      {
        text: 'No, cancel.',
        role: "cancel"
      },
    ]).then((result) => {
      if (result === "yes") {
        this.data.update(reports => reports.filter(item => item.id !== report.id));
        this.storageService.setReports(this.data());
      }
    });
  }

}
