import {
  computed,
  effect,
  Injectable,
  Signal,
  signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { Observable, startWith, switchMap } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { PickedState } from './types';

type Triggers<T> = Partial<{ [P in keyof T]: WritableSignal<number> }>;
type Signals<T> = { [P in keyof T]: WritableSignal<T[P]> };
type SpecificKeysOfObj<T> = { [P in keyof T]: T[P] };
export const notInitializedError =
  'Signal state is not initialized yet, call the initialize() method before using any other methods';
@Injectable()
export class SignalState<T extends Record<string, unknown>> {

  private signals: Signals<T> | undefined;
  private readonly triggers: Triggers<T> = {};
  public readonly state = computed(() => {
    const signals = this.throwOrReturnSignals();
    return Object.keys(signals).reduce((obj, key: keyof T) => {
      obj[key] = signals[key]();
      return obj;
    }, {} as Partial<T>) as T;
  });

  /**
   * Initializes the state with default values
   * @param state: The complete initial state
   */
  public initialize<P extends keyof T>(state: T): void {
    const signals: Partial<Signals<T>> = {};
    (Object.keys(state) as P[]).forEach((key) =>
      signals[key] = signal<T[P]>(state[key])
    );
    this.signals = signals as Signals<T>;
  }

  /**
   * Selects a single piece of the state as a computed Signal and optionally maps it through a
   * mapping function
   * @param key: The key we want to use to extract a piece of state as a signal
   * @param mappingFunction: (Optional) The callback function that will map to the computed signal
   */
  public select<K extends keyof T>(key: K): Signal<T[K]>;
  public select<K extends keyof T, P>(
    key: K,
    mappingFunction: (state: T[K]) => P
  ): Signal<P>;
  public select<K extends keyof T, P>(
    key: K,
    mappingFunction?: (state: T[K]) => P
  ): Signal<T[K] | P> {
    return computed(() => {
      const state = this.throwOrReturnSignals()[key]() as T[K];
      return mappingFunction ? (mappingFunction(state) as P) : (state as T[K]);
    });
  }

  /**
   * Selects multiple pieces of the state as a computed Signal and optionally maps it to a new signal
   * @param keys: The keys we want to use to extract pieces of state as a signal
   * @param mappingFunction: (Optional) The callback function that will map to the computed signal
   */
  public selectMany(keys: (keyof T)[]): Signal<SpecificKeysOfObj<T>>;
  public selectMany<P>(
    keys: (keyof T)[],
    mappingFunction: (obj: SpecificKeysOfObj<T>) => P
  ): Signal<P>;
  public selectMany<P>(
    keys: (keyof T)[],
    mappingFunction?: (obj: SpecificKeysOfObj<T>) => P
  ): Signal<P | SpecificKeysOfObj<T>> {
    return computed(() => {
      const signals = this.throwOrReturnSignals();
      const state = keys.reduce((obj, key) => {
        obj[key] = signals[key]();
        return obj;
      }, {} as Partial<SpecificKeysOfObj<T>>) as SpecificKeysOfObj<T>;
      return mappingFunction ? (mappingFunction(state) as P) : (state as SpecificKeysOfObj<T>);
    });
  }

  /**
   * This method is used to pick pieces of state from somewhere else
   * It will return an object that contains properties as signals.
   * Used best in combination with the connect method
   * @param keys: The keys that are related to the pieces of state we want to pick
   */
  public pick<P extends keyof T>(
    keys: (keyof T)[]
  ): PickedState<T> {
    const signals = this.throwOrReturnSignals();
    return keys.reduce((obj, key) => {
      obj[key] = signals[key];
      return obj;
    }, {} as Partial<PickedState<T>>) as PickedState<T>;
  }

  /**
   * Connects a partial state object where every property is a Signal.
   * It will connect all these signals to the state
   * This will automatically feed the state whenever one of the signals changes
   * It will use an Angular effect to calculate it
   * @param partial: The partial object holding the signals where we want to listen to
   */
  public connect(partial: Partial<{ [P in keyof T]: Signal<T[P]> }>): void {
    this.throwOrReturnSignals();
    Object.keys(partial).forEach((key: keyof T) => {
      effect(
        () => {
          const v = partial[key] as Signal<keyof T>;
          this.patch({ [key]: v() } as Partial<T>);
        },
        // This will update the state, so we need to allow signal writes
        { allowSignalWrites: true }
      );
    });
  }

  /**
   * Connects a partial state object where every property is an RxJS Observable
   * It will connect all these observables to the state and clean up automatically
   * For every key a trigger will be registered that can be called by using the
   * `trigger()` method. The trigger will retrigger the producer function of the Observable in question
   * @param object
   */
  public connectObservables(partial: Partial<{ [P in keyof T]: Observable<T[P]> }>): void {
    this.throwOrReturnSignals();
    Object.keys(partial).forEach((key: keyof T) => {
      this.triggers[key] ||= signal(0);
      const obs$ = partial[key] as Observable<T[keyof T]>;
      toObservable(this.triggers[key] as WritableSignal<number>)
        .pipe(
          startWith(),
          switchMap(() => obs$),
          takeUntilDestroyed(),
        )
        .subscribe((v: Partial<T>[keyof Partial<T>]) => {
          this.patch({ [key]: v } as Partial<T>);
        });
    });
  }

  /**
   * Retriggers the producer function of the Observable that is connected to this key
   * This only works in combination with the `connectObservables()` method.
   * @param key
   */
  public trigger(key: keyof T): void {
    if (!this.triggers[key]) {
      throw new Error(
        'There is no trigger registered for this key! You need to connect an observable. ' +
        'Please use connectObservables to register the triggers',
      );
    }
    (this.triggers[key] as WritableSignal<number>).update((v) => v + 1);
  }

  /**
   * Patches the state with a partial object.
   * This will loop through all the state signals and update
   * them one by one
   * @param partial: The partial state that needs to be updated
   */
  public patch<P extends keyof T>(partial: Partial<T>): void {
    const signals = this.throwOrReturnSignals();
    (Object.keys(partial) as P[]).forEach((key: P) => {
      signals[key].set(partial[key] as T[P]);
    });
  }

  /**
   * Returns the state as a snapshot
   * This will read through all the signals in an untracked manner
   */
  public get snapshot(): T {
    return untracked(() => this.state());
  }

  private throwOrReturnSignals(): Signals<T> {
    if (!this.signals) {
      throw new Error(notInitializedError);
    }
    return this.signals as Signals<T>;
  }
}
