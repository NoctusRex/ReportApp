import {Component, OnInit} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {IonicModule, IonInput} from "@ionic/angular";
import {ActivatedRoute, Router} from "@angular/router";
import {Report} from "../../models/report.model";
import {Game, StorageService} from "../../services/storage.service";

@Component({
  selector: 'app-add',
  templateUrl: './add.page.html',
  styleUrls: ['./add.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  standalone: true
})
export class AddPage implements OnInit {

  id: number | undefined = undefined;
  games: Array<Game> = [];

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
    game: new FormControl<string | undefined>(undefined, Validators.required,),
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
    problem: new FormControl<string | undefined>(undefined, Validators.required),
    solution: new FormControl<string | undefined>(undefined, Validators.required)
  });

  constructor(private activatedRoute: ActivatedRoute, private storageService: StorageService, private router: Router) {
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
        this.form.patchValue({id: undefined, year: new Date().getFullYear()});
      }
    });

    this.storageService.getGames().subscribe(x => {
      this.games = x;
    });
  }

  submit(): void {
    delete this.form.value.judgesValidator;
    delete this.form.value.personsValidator
    
    this.storageService.addOrUpdateReport({...this.form.value, id: this.id} as Report).subscribe(() => {
      this.router.navigate(['reports']);
    });
  }

  getGames() {
    const year = this.form.get("year")?.value;

    if (year ? Number(year) : undefined) {
      return this.games.filter(x => Number(x.year) === Number(year)).map(x => x.name);
    }

    return this.games.map(x => x.name);
  }

  getErrorText(id: string): string | null {
    const errors = this.form.get(id)?.errors;

    if (!errors) return null;

    return Object.entries(errors).find(
      ([, value]) => value !== true
    )?.[1] ?? null;
  }

  addInput(input: IonInput, id: string): void {
    input.setFocus();

    if (!input.value) {
      return;
    }

    const inputs = this.form.get(id)?.value || [];
    this.form.get(id)?.setValue([...inputs, input.value as string]);
    this.form.get(`${id}Validator`)?.updateValueAndValidity();
    input.value = undefined;
  }

  removeInput(input: IonInput, id: string): void {
    if (input.value) {
      return;
    }

    const inputs = this.form.get(id)?.value || [];
    this.form.get(id)?.setValue(inputs.slice(0, inputs.length - 1));
    this.form.get(`${id}Validator`)?.updateValueAndValidity();
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
