import { notInitializedError, SignalState } from './signal-state';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject, Subject, tap } from 'rxjs';

type TestState = {
  firstName: string;
  lastName: string;
};
const initialState = {
  firstName: 'Brecht',
  lastName: 'Billiet',
};
const patchedState = {
  firstName: 'Brecht2',
  lastName: 'Billiet2',
};

@Component({
  template: '',
})
class MyComponent extends SignalState<TestState> {
  public firstName = signal(initialState.firstName);
  public lastName = signal(initialState.lastName);

  public constructor() {
    super();
    this.initialize(initialState);
    this.connect({
      firstName: this.firstName,
      lastName: this.lastName,
    });
  }
}

@Component({
  template: '',
})
class WithObservablesComponent extends SignalState<TestState & { producerFirstName: number }> {
  public firstName$$ = new BehaviorSubject<string>(patchedState.firstName);
  public lastName$$ = new BehaviorSubject<string>(patchedState.lastName);

  public constructor() {
    super();
    this.initialize({ ...initialState, producerFirstName: 0 });
    this.connectObservables({
      firstName: this.firstName$$.pipe(tap(() => this.patch({ producerFirstName: this.snapshot.producerFirstName + 1 }))),
      lastName: this.lastName$$,
    });
  }
}

describe('signal state', () => {
  describe('on initialize()', () => {
    it('should initialize the state correctly', () => {
      const state = new SignalState<TestState>();

      state.initialize(initialState);
      expect(state.snapshot).toEqual(initialState);
      expect(state.state()).toEqual(initialState);
    });
  });

  describe('on select()', () => {
    describe('when not initialized', () => {
      it('should throw an error', () => {
        const state = new SignalState<TestState>();
        expect(() => {
          state.select('firstName')();
        }).toThrowError(notInitializedError);
      });
    });
    it('should select the correct piece of state', () => {
      const state = new SignalState<TestState>();
      state.initialize(initialState);
      expect(state.select('firstName')()).toEqual(initialState.firstName);
      expect(state.select('lastName')()).toEqual(initialState.lastName);
      state.patch(patchedState);
      expect(state.select('firstName')()).toEqual(patchedState.firstName);
      expect(state.select('lastName')()).toEqual(patchedState.lastName);
    });
  });
  describe('on selectMany()', () => {
    describe('when not initialized', () => {
      it('should throw an error', () => {
        const state = new SignalState<TestState>();
        expect(() => {
          state.selectMany(['firstName', 'lastName'])();
        }).toThrowError(notInitializedError);
      });
    });
    it('should select the correct pieces of state', () => {
      const state = new SignalState<TestState>();
      state.initialize(initialState);
      expect(state.selectMany(['firstName', 'lastName'])()).toEqual(initialState);
      state.patch(patchedState);
      expect(state.selectMany(['firstName', 'lastName'])()).toEqual(patchedState);
    });
  });
  describe('on pick()', () => {
    describe('when not initialized', () => {
      it('should throw an error', () => {
        const state = new SignalState<TestState>();
        expect(() => {
          state.pick(['firstName', 'lastName']);
        }).toThrowError(notInitializedError);
      });
    });
    it('should return an object with the correct pieces of state as signals', () => {
      const state = new SignalState<TestState>();
      state.initialize(initialState);
      const picked = state.pick(['firstName', 'lastName']);
      expect(picked.firstName()).toEqual(initialState.firstName);
      expect(picked.lastName()).toEqual(initialState.lastName);
      state.patch(patchedState);
      expect(picked.firstName()).toEqual(patchedState.firstName);
      expect(picked.lastName()).toEqual(patchedState.lastName);
    });
  });
  describe('on connect()', () => {
    describe('when not initialized', () => {
      it('should throw an error', () => {
        const state = new SignalState<TestState>();
        expect(() => {
          state.connect({
            firstName: signal('firstName'),
            lastName: signal('lastName'),
          });
        }).toThrowError(notInitializedError);
      });
    });
    it('should listen to the passed signals and patch the state', () => {
      TestBed.configureTestingModule({
        declarations: [MyComponent],
      }).compileComponents();
      const fixture = TestBed.createComponent(MyComponent);
      const component = fixture.componentRef.instance;
      fixture.detectChanges();
      expect(component.state().firstName).toEqual(component.firstName());
      expect(component.state().lastName).toEqual(component.lastName());
      component.firstName.set('Brecht3');
      component.lastName.set('Billiet3');
      fixture.detectChanges();
      expect(component.state().firstName).toEqual('Brecht3');
      expect(component.state().lastName).toEqual('Billiet3');
    });
  });
  describe('on patch()', () => {
    describe('when not initialized', () => {
      it('should throw an error', () => {
        const state = new SignalState<TestState>();
        expect(() => {
          state.patch({ lastName: '', firstName: '' });
        }).toThrowError(notInitializedError);
      });
    });
    it('should patch the state', () => {
      const state = new SignalState<TestState>();
      state.initialize(initialState);
      state.patch(patchedState);
      expect(state.snapshot).toEqual(patchedState);
      expect(state.state()).toEqual(patchedState);
    });
  });
  describe('on connectObservables()', () => {
    describe('when not initialized', () => {
      it('should throw an error', () => {
        const state = new SignalState<TestState>();
        const lastName$$ = new Subject<string>();
        const firstName$$ = new Subject<string>();
        expect(() => {
          state.connectObservables({ lastName: lastName$$, firstName: firstName$$ });
        }).toThrowError(notInitializedError);
      });
    });
    it('should subscribe to the passed observables and pass the state', () => {
      TestBed.configureTestingModule({
        declarations: [WithObservablesComponent],
      }).compileComponents();
      const fixture = TestBed.createComponent(WithObservablesComponent);
      const component = fixture.componentRef.instance;
      fixture.detectChanges();
      expect(component.state().firstName).toEqual('Brecht2');
      expect(component.state().lastName).toEqual('Billiet2');
      component.lastName$$.next('Billiet3');
      component.firstName$$.next('Brecht3');
      fixture.detectChanges();
      expect(component.state().firstName).toEqual('Brecht3');
      expect(component.state().lastName).toEqual('Billiet3');
    });
    it('should re-execute the producer function when the trigger method is called', () => {
      TestBed.configureTestingModule({
        declarations: [WithObservablesComponent],
      }).compileComponents();
      const fixture = TestBed.createComponent(WithObservablesComponent);
      const component = fixture.componentRef.instance;
      fixture.detectChanges();
      expect(component.state().producerFirstName).toEqual(1);
      component.trigger('firstName');
      fixture.detectChanges();
      component.trigger('firstName');
      fixture.detectChanges();
      component.trigger('firstName');
      fixture.detectChanges();
      expect(component.state().producerFirstName).toEqual(4);
    });
  });
});
