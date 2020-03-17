import { Injectable } from "@angular/core";
import { AbstractControl, FormGroup } from "@angular/forms";
import { Constants } from "./app-config";
import * as Filter from "bad-words";

const filter = new Filter();

const CONFIRM_PASSWORD = "confirmPassword";

interface ValidationMethod {
    type: string;
    message: string;
}

const alphanumRegex: RegExp = /^[^\s\\]+$/i;

@Injectable()
export class FormValidationService {
    constructor() {
    }

    public noWhitespaceValidator(control: AbstractControl): { [key: string]: boolean } | null {
        if (!alphanumRegex.test(control.value)) {
            return { pattern: true };
        }
        return null;
    }

    public noBadWordsValidator(control: AbstractControl): { [key: string]: boolean } | null {
        if (filter.isProfane(control.value)) {
            return { badWord: true };
        }
        return null;
    }

    public checkIfFormElementInvalid(
        form: FormGroup,
        element: string,
        validation: ValidationMethod,
        submitAttempt: boolean
    ): boolean {
        return (
            form.get(element).hasError(validation.type) &&
            (form.get(element).dirty || form.get(element).touched || (form.get(element).untouched && submitAttempt))
        );
    }

    public checkIfPasswordsMatch(formGroup: FormGroup): { [key: string]: boolean } | null {
        let password = formGroup.get(Constants.PASSWORD).value;
        let confirmPassword = formGroup.get(CONFIRM_PASSWORD).value;

        return password === confirmPassword ? null : { misMatch: true };
    }
}
