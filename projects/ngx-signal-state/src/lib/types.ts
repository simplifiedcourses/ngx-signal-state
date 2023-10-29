import { Signal } from '@angular/core';

export type PickedState<T> = { [P in keyof T]: Signal<T[P]> };
