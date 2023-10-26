# ngx-signal-state: Opinionated Microsized Simple State management for Angular Signals
![ngx-signal-state.png](..%2Fassets%2Fngx-signal-state.png)

| Principle      |     | Description                                                 |
| -------------- | --- | ----------------------------------------------------------- |
| Simple         | [x] | Only a handful methods, no complex ngrx structures          |
| Small          | [x] | Minified and compressed: 2KB                                |
| Opinionated    | [x] | Structured and opinionated way of state management          |
| No boilerplate | [x] | No selectors, reducers, actions, action types, effects, ... |
| Easy to learn  | [x] | Provides everything, but still very small                   |
| Battle tested  | [x] | Tested with big clients                                     |
| Type-safe      | [x] | High focus on type-safety                                   |
| Examples       | [x] | Working on tons of examples as we speak                     |

### Why not just use Signals?

- [x] ngx-signal-state is more opinionated
- [x] Advanced selecting logic, `select()`, `selectMany()`
- [x] Forces us to treat components as state machines
- [x] Clean api
- [x] Because we can patch multiple signals in one command
- [x] Connect functionality
- [x] Plays well with Observables too
- [x] Retrigger producer functions of connected observables
- [x] Pick functionality of external states
- [x] Easy snapshot
- [x] State initialization in one place

## The principles

This state management library has 2 important goals:
- **Simplifying** state management: **KISS always!!**
- **Opinionated** state management

The principles are:
- Every ui component is treated as a state machine
- Every smart component is treated as a state machine
- Features (Angular lazy loaded chunks) can have state machines shared for that feature
- Application-wide there can be multiple global state machines
- State machines can be provided on all levels of the injector tree
- We can pick pieces of state from other state machines and add a one-way communication between them

**The best practice here is to keep the state as low as possible.**

## Getting started

### Starting with ngx-signal-state

We can start by installing `ngx-signal-state` with **npm** or **yarn**.
After that we can import `SignalState` like this:

```typescript
import { SignalState } from 'ngx-signal-state';
```
### Creating a state machine for a component

Creating a state machine for a component is simple. We just have to create a specific type
for the state and extend our component from `SignalState<T>`;

```typescript
type MyComponentState = {
  firstName: string;
  lastName: string;
}

export class MyComponent extends SignalState<MyComponentState> {
}
```

### Initializing the state machine

We can not consume `SignalState` functionality before we have initialized the state
in the constructor with the `initialize()` method:

```typescript
export class MyComponent extends SignalState<MyComponentState> {
  constructor(props) {
    super(props);
    this.initialize({
      firstName: 'Brecht',
      lastName: 'Billiet'
    })
  }
}
```

### Getting the state as signals

There are 3 ways to get the state as a signal.
- `this.state` will return the state as a signal.
- `this.select('propertyName')` will return a signal for the property that we provide.
- `this.selectMany(['firstName', 'lastName'])`will return a signal with multiple pieces of state in it.

```typescript
export class MyComponent extends SignalState<MyComponentState> {
...
  // Fetch the entire state as a signal
  state: Signal<MyComponentState> = this.state;

  // Only select one property and return it as a signal
  firstName: Signal<string> = this.select('firstName');

  // Select multiple properties as a signal
  firstAndLastName: Signal<{firstName: string, lastName: string}>
    = this.selectMany(['firstName', 'lastName'])
}
```

It's possible to add mapping functions as the second argument of the `select()` and `selectMany()` methods:

```typescript
export class MyComponent extends SignalState<MyComponentState> {
...
  // Pass a mapping function
  firstName: Signal<string> = this.select('firstName', firstname => firstname + '!!');

  // Pass a mapping function
  fullName: Signal<{firstName: string, lastName: string}>
    = this.selectMany(['firstName', 'lastName'], ({firstName, lastName}) => `${firstName} ${lastName}`)
}
```

### Getting the state as a snapshot

Sometimes we want an untracked snapshot. For that we can use the `snapshot` getter that will not
keep track of its consumers.

```typescript
export class MyComponent extends SignalState<MyComponentState> {
...
  protected save(): void {
    // Pick whatever we want from the snapshot of the state
    const {firstName, lastName} = this.snapshot;
    console.log(firstName, lastName);
  }
}
```

### Patching state

Setting multiple signals at the same time can be a drag. The `SignalState` offers a `patch()` method where we can pass a partial of the entire state.

```typescript
export class MyComponent extends SignalState<MyComponentState> {
...
  protected userChange(user: User): void {
    this.patch({firstName: user.firstName, lastName: user.lastName});
  }
}
```

### Connecting signals to the state

Sometimes we want to calculate pieces of state and connect those to our state machine.
Any signal that we have can be connected to the state. Some examples are:
- Pieces of other state machines (global state)
- Signals that are provided by Angular (Input signals, query signals,...)
- Calculated pieces of signals that are calculated by the `selectManhy()` method

To connect signals to the state we can use the `connect()` method where we pass a partial object where
every property is a signal. In the following example we can see that we have a state for a component that has products with
client-side pagination and client-side filtering. We keep `products` as state that we will load from the backend, but have 2
calculated pieces of state: `filteredProducts` and `pagedProducts`. `filteredProducts` is calculated based on the `products` and `query`.
`pagedProducts` is calculated based on `filteredProducts`, `pageIndex` and `itemsPerPage`. It should be clear how pieces of state are
being calculated based on other pieces of state. In the `connect()` method we can connect these signals and the state machine would
get automatically updated:

```typescript
export class MyComponent extends SignalState<MyComponentState> {
  constructor(props) {
    super(props);
    this.initialize({
      pageIndex: 0,
      itemsPerPage: 5,
      query: '',
      products: [],
      filteredProducts: [],
      pagedProducts: [],
    });
    // Calculate the filtered products and store them in a signal
    const filteredProducts = this.selectMany(['products', 'query'],
      ({ products, query }) => {
        return products.filter(p => p.name.toLowerCase().indexOf(query.toLowerCase()) > -1)
      })

    // Calculate the paged products and store them in a signal
    const pagedProducts = this.selectMany(['filteredProducts', 'pageIndex', 'itemsPerPage'],
      ({ filteredProducts, pageIndex, itemsPerPage }) => {
        const offsetStart = (pageIndex) * itemsPerPage;
        const offsetEnd = (pageIndex + 1) * itemsPerPage;
        return filteredProducts.slice(offsetStart, offsetEnd);
      })
    // Connect the calculated signals
    this.connect({
      filteredProducts,
      pagedProducts,
    })
  }
}
```

### Connecting Observables to the state

While it is handy to connect signals to the state, it is also handy to connect Observables to the state.
These Observables can be derived from form `valueChanges`, `activatedRoute` or even `http` Observables.
The `connectObservables()` method will do 4 things for us:
- Subscribe to the observable and feed the results to the local state machine
- Only execute the producer function once ==> no more multicasting issues
- Clean up after itself ==> No memory leaks
- Register a trigger that can be called later with the `trigger()` method to re-execute the producer function of the Observable

```typescript
export class MyComponent extends SignalState<MyComponentState> {
  constructor(props) {
    super(props);
  ...
    this.connectObservables({
      // Only execute the call once
      products: this.productService.getProducts(),
      // Adds a timer
      time: interval(1000).pipe(map(() => new Date().getTime())),
    })
  }
}
```

### Retriggering Observables

Sometimes we want to re-execute the producer function of an observable that is connected to the state. The most recurring example is the
execution of an ajax call. In this example we see how we can refetch users with the `trigger()` method.

```typescript
export class MyComponent extends SignalState<MyComponentState> {
  constructor(props) {
    super(props);
  ...
    // Connect products and register a trigger behind the scenes
    this.connectObservables({
      // Only execute the call once
      products: this.productService.getProducts(),
    })
  }

  protected refreshProducts(): void {
    // Results in new a `this.productService.getProducts()` call
    this.trigger('products');
  }
}
```

### Picking state

Every component should be treated as a state machine. Every state class should be treated as a state machine.
However, sometimes we want to pick state from other state machines. The principle of picking state is that we listen
to that state in a one way communication. If we pick a state we will get notified of updates, but when we do changes to our
local state it will not reflect in the state we are listening to:

```typescript
export class AppComponent extends SignalState<AppComponentState>{
  private readonly shoppingCartState = inject(ShoppingCartSignalState)
  constructor() {
    super();
    this.initialize({
      ...
        // set initial values
        entries: this.shoppingCartState.snapshot.entries,
      paid: this.shoppingCartState.snapshot.paid
  });
    this.connect({
      // listen to pieces of state in the shoppingCartState and connect it to our local state
      ...this.shoppingCartState.pick(['entries', 'paid'])
    })
  }
...
}

```

### Creating a state class

We should treat all our components as state machines, but sometimes we also need to share state.
For that we can create simple state classes. This is an example of a **shopping cart** state:

```typescript
export type ShoppingCartState = {
  entries: ShoppingCartEntry[]
}

@Injectable(
  {
    // Our provide anywhere in the injector tree
    providedIn: 'root'
  }
)
export class ShoppingCartSignalState extends SignalState<ShoppingCartState> {
  constructor() {
    super();
    // initialize the state
    this.initialize({
      entries: []
    })
  }

  public addToCart(entry: ShoppingCartEntry): void {
    // Update the state in an immutable way
    const entries = [...this.snapshot.entries, entry];
    this.patch({ entries });
  }

  public deleteFromCart(id: number): void {
    // Update the state in an immutable way
    const entries = this.snapshot.entries.filter(entry => entry.productId !== id);
    this.patch({ entries });
  }

  public updateAmount(id: number, amount: number): void {
    // Update the state in an immutable way
    const entries = this.snapshot.entries.map(item => item.productId === id ? { ...item, amount } : item);
    this.patch({ entries });
  }
}

```

This state is provided in the root of the application, so it will be a singleton.
However, we can also provide any signal state machine on all levels of the application by using the `providers` property:
- root
- feature
- smart component
- ui component

## Examples

Examples of the use of this library can be found in `projects/examples`.
To start the backend api run `npm run api` and to start the demo application run `npm start`.

## Collaborate

Do you want to collaborate on this with me?
Reach out at [brecht@simplified.courses](mailto://brecht@simplified.courses)!
