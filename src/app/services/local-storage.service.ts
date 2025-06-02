import {Injectable} from "@angular/core";

@Injectable({providedIn: 'root'})
export class LocalStorageService {

  get LOCAL_STORAGE_JUDGE_NAME_KEY() {
    return "DMMIB_REPORTS_JUDGE_NAME"
  }

  getJudgeName(): string | null {
    return localStorage.getItem(this.LOCAL_STORAGE_JUDGE_NAME_KEY);
  }

  setJudgeName(judgeName: string) {
    localStorage.setItem(this.LOCAL_STORAGE_JUDGE_NAME_KEY, judgeName);
  }
}
