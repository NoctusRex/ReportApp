import {Component, OnInit, signal} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {IonicModule, ViewDidEnter} from "@ionic/angular";
import {Report} from "../../models/report.model";
import {ActionSheetService} from "../../services/action-sheet.service";
import {Router} from "@angular/router";
import {FireBaseStorageService} from "../../services/firebase-storage.service";


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
export class ReportsPage implements ViewDidEnter, OnInit {
  data = signal([] as Array<Report>);
  progressBarColor = 'primary';


  constructor(private actionSheet: ActionSheetService,
              private router: Router,
              private storageService: FireBaseStorageService) {
  }

  ngOnInit(): void {
    this.ionViewDidEnter();
  }

  ionViewDidEnter(): void {
    this.storageService.getReports().subscribe(x => {
      this.data.set(x);
    })
  }

  async open(report: Report): Promise<void> {
    await this.router.navigate(["report", report.id]);
  }

  async add(): Promise<void> {
    await this.router.navigate(["report"]);
  }

  delete(report: Report): void {
    this.progressBarColor = 'danger';

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
        this.storageService.deleteReport(report.id).subscribe(() => {
          this.data.update(reports => reports.filter(item => item.id !== report.id));
        });
      }
    }).finally(() => {
      this.progressBarColor = 'primary';
    });
  }

}
