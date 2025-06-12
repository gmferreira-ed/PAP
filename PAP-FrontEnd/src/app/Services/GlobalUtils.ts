import { AbstractControl, FormGroup } from "@angular/forms";

function randomString(length = 8): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function randomNumber(min = 0, max = 1000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const GlobalUtils = {
    ObjectInfo(obj: Record<string, Record<string, any>>): any[] {
        return Object.entries(obj).map(([key, values]) => {
            return {
                Key: key,
                ...values
            };
        });
    },

    FormatName(name: string) {
        return name.replace(/([A-Z])/g, ' $1').trim();
    },

    fillForm(form: FormGroup): void {
        Object.keys(form.controls).forEach(key => {
            const control: AbstractControl = form.get(key)!;
            const value = control.value;

            if (typeof value === 'number') {
                control.setValue(randomNumber());
            } else if (typeof value === 'string') {
                control.setValue(randomString());
            } else if (control instanceof FormGroup) {
                // Recursively fill nested FormGroups
                this.fillForm(control);
            } else {
                console.warn("Odd field", key)
                control.setValue(randomString());
            }
        });
    },


    ToSQLDate(DateToConvert?: Date | string | null) {
        if (typeof (DateToConvert) == 'string') {
            DateToConvert = new Date(DateToConvert)
        }
        return DateToConvert && !isNaN(DateToConvert.getTime()) && DateToConvert.toISOString().slice(0, 19).replace('T', ' ') || undefined
    },
};

export default GlobalUtils;