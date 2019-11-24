import {Injectable} from "@angular/core";
import {isAlphanumeric} from "validator";
import {AbstractControl, FormControl, FormGroup, FormGroupDirective, NgForm} from "@angular/forms";
import {CommonService} from "./common.service";
import {ErrorStateMatcher} from "@angular/material/core";
import {AuthenticationService} from "./authentication.service";

interface ValidationMethod {
  type: string,
  message: string
}

@Injectable()
export class FormValidationService {

  constructor(private authService: AuthenticationService) {
  }

  public isAlphanumericValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if(!isAlphanumeric(control.value)) {return {'pattern': true};}
    return null;
  }

  public checkIfFormElementInvalid(form: FormGroup, element: string, validation: ValidationMethod, submitAttempt: boolean){
    return form.get(element).hasError(validation.type) && (form.get(element).dirty || form.get(element).touched || (form.get(element).untouched && submitAttempt));
  }

  public checkIfPasswordsMatch(formGroup: FormGroup): { [key: string]: boolean } | null {
    let password = formGroup.get('password').value;
    let confirmPassword = formGroup.get('confirmPassword').value;

    return password === confirmPassword ? null : {'misMatch': true}
  }

}

export class ParentErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const invalidCtrl = !!(control && control.invalid && control.parent.dirty);
    const invalidParent = !!(control && control.parent && control.parent.invalid && control.parent.dirty);
    return (invalidCtrl || invalidParent);
  }


}
