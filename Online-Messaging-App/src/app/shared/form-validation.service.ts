import {Injectable} from "@angular/core";
import {isAlphanumeric} from "validator";
import {AbstractControl, FormGroup} from "@angular/forms";
import {Constants} from "./app-config";

const CONFIRM_PASSWORD = "confirmPassword";

interface ValidationMethod {
    type: string,
    message: string
}

@Injectable()
export class FormValidationService {

    constructor() {
    }

    public isAlphanumericValidator(control: AbstractControl): { [key: string]: boolean } | null {
        if (!isAlphanumeric(control.value)) {
            return {pattern: true};
        }
        return null;
    }

    public checkIfFormElementInvalid(form: FormGroup, element: string, validation: ValidationMethod, submitAttempt: boolean): boolean {
        return form.get(element).hasError(validation.type) && (form.get(element).dirty || form.get(element).touched || (form.get(element).untouched && submitAttempt));
    }

    public checkIfPasswordsMatch(formGroup: FormGroup): { [key: string]: boolean } | null {
        let password = formGroup.get(Constants.PASSWORD).value;
        let confirmPassword = formGroup.get(CONFIRM_PASSWORD).value;

        return password === confirmPassword ? null : {misMatch: true};
    }

}
