import { ChangeDetectionStrategy, Component, HostBinding, Input, ViewEncapsulation } from '@angular/core';

export enum AppButtonTypes {
    regular = 'regular',
    submit = 'submit'
}

@Component({
    selector: 'app-button',
    templateUrl: './app-button.component.html',
    styleUrls: ['./app-button.component.css'],
    encapsulation: ViewEncapsulation.ShadowDom,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppButtonComponent {
    @HostBinding('class') @Input() type: AppButtonTypes = AppButtonTypes.regular;
}
