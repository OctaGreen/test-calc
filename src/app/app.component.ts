import { ChangeDetectorRef, HostListener } from '@angular/core';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppButtonTypes } from './app-button/app-button.component';

export enum NumericKeys {
    seven = '7',
    eight = '8',
    nine = '9',
    four = '4',
    five = '5',
    six = '6',
    one = '1',
    two = '2',
    three = '3',
    doubleZero = '00',
    zero = '0'
}

export enum HighPriorityOperationKeys {
    squareRoot = '√'
}

export enum MediumPriorityOperationKeys {
    obelus = '%',
    divide = '/',
    multiply = '*'
}

export enum LowPriorityOperationKeys {
    minus = '-',
    plus = '+'
}

export enum DelimiterKeys {
    comma = '.',
    leftParenthesis = '(',
    rightParenthesis = ')'
}

export enum SpecialKeys {
    escape = 'Escape',
    enter = 'Enter'
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
    equation: string = '';
    result: number = 0;
    appButtonTypes: typeof AppButtonTypes = AppButtonTypes;
    numericKeys: typeof NumericKeys = NumericKeys;
    highPriorityOperationKeys: typeof HighPriorityOperationKeys = HighPriorityOperationKeys;
    mediumPriorityOperationKeys: typeof MediumPriorityOperationKeys = MediumPriorityOperationKeys;
    lowPriorityOperationKeys: typeof LowPriorityOperationKeys = LowPriorityOperationKeys;
    delimiterKeys: typeof DelimiterKeys = DelimiterKeys;
    specialKeys: typeof SpecialKeys = SpecialKeys;
    allowedKeys: string[] = [
        ...(Object.values(this.numericKeys) as string[]),
        ...(Object.values(this.highPriorityOperationKeys) as string[]),
        ...(Object.values(this.mediumPriorityOperationKeys) as string[]),
        ...(Object.values(this.lowPriorityOperationKeys) as string[]),
        ...(Object.values(this.delimiterKeys) as string[]),
        ...(Object.values(this.specialKeys) as string[])
    ];

    constructor(private readonly changeDetector: ChangeDetectorRef) {}

    @HostListener('document:keyup', ['$event'])
    buttonClicked(event: { key: string }): void {
        if (event.key === SpecialKeys.escape) {
            this.equation = '';
            this.result = 0;
            this.changeDetector.detectChanges();
        } else if (event.key === SpecialKeys.enter) {
            this.calculateEquation();
        } else if (this.allowedKeys.includes(event.key)) {
            this.equation += event.key;
            this.changeDetector.detectChanges();
        }
    }

    private calculateEquation(): void {
        try {
            const flatExpression: string = this.calculateExpressionInParenthesis(this.equation);
            this.result = Number(this.calculateExpression(flatExpression));
            this.changeDetector.detectChanges();
        } catch (error) {
            console.error(error);
            alert(error);
        }
    }

    private calculateExpressionInParenthesis(expression: string): string {
        const parenthesisPattern: RegExp = new RegExp(
            `\\${DelimiterKeys.leftParenthesis}([0-9]|\\${DelimiterKeys.comma}|\\${Object.values(
                this.highPriorityOperationKeys
            ).join('|\\')}|\\${Object.values(this.mediumPriorityOperationKeys).join('|\\')}|\\${Object.values(
                this.lowPriorityOperationKeys
            ).join('|\\')})+\\${DelimiterKeys.rightParenthesis}`
        );
        expression = this.performReplacement(expression, parenthesisPattern, (substr) =>
            this.calculateExpression(
                substr.replace(
                    new RegExp(`\\${DelimiterKeys.leftParenthesis}|\\${DelimiterKeys.rightParenthesis}`, 'g'),
                    ''
                )
            )
        );
        return expression;
    }

    private calculateExpression(expression: string): string {
        // calculate square root
        const highPriorityOperationsPattern: RegExp = new RegExp(
            `(\\${Object.values(this.highPriorityOperationKeys).join('|\\')})[0-9]+(\\${DelimiterKeys.comma}[0-9]+)?`
        );
        expression = this.performReplacement(
            expression,
            highPriorityOperationsPattern,
            (substr: string) => `${this.performCalculation(substr)}`
        );
        // calculate %, /, *
        const mediumPriorityOperationsPattern: RegExp = new RegExp(
            `[0-9]+(\\${DelimiterKeys.comma}[0-9]+)?(\\${Object.values(this.mediumPriorityOperationKeys).join(
                '|\\'
            )})[0-9]+(\\${DelimiterKeys.comma}[0-9]+)?`
        );
        expression = this.performReplacement(
            expression,
            mediumPriorityOperationsPattern,
            (substr: string) => `${this.performCalculation(substr)}`
        );
        // calculate +, -
        const lowPriorityOperationsPattern: RegExp = new RegExp(
            `[0-9]+(\\${DelimiterKeys.comma}[0-9]+)?(\\${Object.values(this.lowPriorityOperationKeys).join(
                '|\\'
            )})[0-9]+(\\${DelimiterKeys.comma}[0-9]+)?`
        );
        expression = this.performReplacement(
            expression,
            lowPriorityOperationsPattern,
            (substr: string) => `${this.performCalculation(substr)}`
        );
        // final expression must be a valid Number, otherwise it's a syntax error
        if (Number.isNaN(Number(expression))) {
            throw 'The syntax of this equation is incorrect';
        }

        return expression;
    }

    private performReplacement(expression: string, pattern: RegExp, callback: (substring: string) => string): string {
        while (pattern.test(expression)) {
            expression = expression.replace(pattern, callback);
        }
        return expression;
    }

    private performCalculation(substr: string): number {
        const operatorsPattern: RegExp = new RegExp(
            `\\${Object.values(this.highPriorityOperationKeys).join('|\\')}|\\${Object.values(
                this.mediumPriorityOperationKeys
            ).join('|\\')}|\\${Object.values(this.lowPriorityOperationKeys).join('|\\')}`,
            'g'
        );
        const found: string[] | null = substr.match(operatorsPattern);
        if (!found || found.length > 1) {
            throw 'The syntax of this equation is incorrect';
        } else if (found[0] === HighPriorityOperationKeys.squareRoot) {
            return Math.sqrt(Number(substr.split(operatorsPattern).filter((value: string) => value !== '')[0]));
        } else if (found[0] === MediumPriorityOperationKeys.obelus) {
            return substr
                .split(operatorsPattern)
                .map((value: string) => Number(value))
                .reduce((accumulator, current) => accumulator % current);
        } else if (found[0] === MediumPriorityOperationKeys.multiply) {
            return substr
                .split(operatorsPattern)
                .map((value: string) => Number(value))
                .reduce((accumulator, current) => accumulator * current);
        } else if (found[0] === MediumPriorityOperationKeys.divide) {
            return substr
                .split(operatorsPattern)
                .map((value: string) => Number(value))
                .reduce((accumulator, current) => accumulator / current);
        } else if (found[0] === LowPriorityOperationKeys.plus) {
            return substr
                .split(operatorsPattern)
                .map((value: string) => Number(value))
                .reduce((accumulator, current) => accumulator + current);
        } else if (found[0] === LowPriorityOperationKeys.minus) {
            return substr
                .split(operatorsPattern)
                .map((value: string) => Number(value))
                .reduce((accumulator, current) => accumulator - current);
        } else {
            throw 'Equation contains unsupported operation';
        }
    }
}
