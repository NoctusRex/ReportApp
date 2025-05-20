import {ActionSheetController} from "@ionic/angular/standalone";
import {Injectable} from "@angular/core";


@Injectable({providedIn: 'root'})
export class ActionSheetService {

  constructor(private actionSheetCtrl: ActionSheetController) {
  }

  async show(header: string, buttons: Array<{ text: string; role: string }>): Promise<string | undefined> {
    let as = await this.actionSheetCtrl.create({header, buttons});
    await as.present();
    let result = await as.onDidDismiss();

    return result.role === 'backdrop' || result.role === 'cancel' ? undefined : result.role;
  }
}
