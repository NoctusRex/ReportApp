import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {IonicModule} from "@ionic/angular";
import {ActivatedRoute, Router} from "@angular/router";
import {Report, ReportLevel} from "../../models/report.model";
import {FireBaseStorageService} from "../../services/firebase-storage.service";
import {LocalStorageService} from "../../services/local-storage.service";
import {ModalService} from "../../services/modal.service";

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
  ],
  standalone: true
})
export class AddPage implements OnInit {

  id: number | undefined = undefined;

  form = new FormGroup({
    id: new FormControl<number | undefined>({disabled: true, value: undefined}, Validators.required),
    year: new FormControl<number | undefined>(undefined, {
      validators: [Validators.required, control => {
        if (new RegExp("^\\d{4}$").test(control.value)) {
          return null;
        }

        return {error: "Invalid Date"};
      }]
    }),
    persons: new FormControl<Array<string> | undefined>(undefined, Validators.required),
    personsValidator: new FormControl<string | undefined>(undefined, _control => {
      if ((this.form?.get("persons")?.value || []).length > 0) {
        return null;
      }

      return {error: "At least one player is required"};
    }),
    judges: new FormControl<Array<string> | undefined>(undefined, Validators.required),
    judgesValidator: new FormControl<string | undefined>(undefined, _control => {
      if ((this.form?.get("judges")?.value || []).length > 0) {
        return null;
      }

      return {error: "At least one judge is required"};
    }),
    report: new FormControl<string | undefined>(undefined, Validators.required),
    level: new FormControl<ReportLevel | undefined>(undefined, Validators.required)
  });

  constructor(private activatedRoute: ActivatedRoute,
              private storageService: FireBaseStorageService,
              private router: Router,
              private localStorageService: LocalStorageService,
              private modalService: ModalService) {
  }

  get disabled() {
    return !this.form.valid;
  }

  get progressBarColor(): string {
    return this.disabled ? "danger" : this.id ? "primary" : "success";
  }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
      const id = params['id'] ?? undefined;
      this.id = id ? Number(id) : undefined;

      if (this.id) {
        this.storageService.getReport(this.id).subscribe(existing => {
          if (existing) {
            this.form.patchValue({
              ...existing,
              persons: existing.persons,
              judges: existing.judges,
              judgesValidator: undefined,
              personsValidator: undefined
            });
          }
        });
      } else {
        const judge = this.localStorageService.getJudgeName();
        this.form.patchValue({
          id: undefined,
          year: new Date().getFullYear(),
          judges: judge ? [judge] : undefined
        });
      }
    });
  }

  submit(): void {
    delete this.form.value.judgesValidator;
    delete this.form.value.personsValidator

    this.storageService.addOrUpdateReport({...this.form.value, id: this.id} as Report).subscribe(() => {
      this.router.navigate(['reports']);
    });
  }

  getErrorText(id: string): string | null {
    const errors = this.form.get(id)?.errors;

    if (!errors) return null;

    return Object.entries(errors).find(
      ([, value]) => value !== true
    )?.[1] ?? null;
  }

  addInput(input: string, id: string): void {
    if (!input) {
      return;
    }

    const inputs = this.form.get(id)?.value || [];
    this.form.get(id)?.setValue([...inputs, input]);
    this.form.get(`${id}Validator`)?.updateValueAndValidity();
  }

  addName(key: string): void {
    const year = this.form.get("year")?.value;

    (key === 'judges' ? this.modalService.getJudgeName(undefined, false, false) : this.modalService.getPlayerName(year))
      .subscribe(x => {
        if (!x) {
          return;
        }

        this.addInput(x, key);
      });
  }

  removeInputByIndex(index: number, id: string): void {
    const inputs = this.form.get(id)?.value || [];

    if (index >= 0 && index < inputs.length) {
      const updated = [...inputs];
      updated.splice(index, 1);
      this.form.get(id)?.setValue(updated);
      this.form.get(`${id}Validator`)?.updateValueAndValidity();
    }
  }
}
