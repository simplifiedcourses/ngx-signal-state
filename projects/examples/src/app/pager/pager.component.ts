import { Component, computed, EventEmitter, Input, Output, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignalState } from 'ngx-signal-state';

type ViewModel = Readonly<{
  itemFrom: number;
  itemTo: number;
  total: number;
  previousDisabled: boolean;
  nextDisabled: boolean;
  showItemsPerPage: boolean;
  itemsPerPageOptions: number[];
}>;

type PagerInputState = {
  itemsPerPage: number;
  total: number;
  pageIndex: number;
}
type PagerState = PagerInputState & {
  showItemsPerPage: boolean;
  itemsPerPageOptions: number[];
}

@Component({
  selector: 'si-pager',
  standalone: true,
  imports: [CommonModule],
  template: `
      Showing {{ vm.itemFrom }}
      to
      {{ vm.itemTo }}
      of {{ vm.total }} entries
      <button (click)="goToStart()" [disabled]="vm.previousDisabled">
          Begin
      </button>
      <button (click)="previous()" [disabled]="vm.previousDisabled">
          Previous
      </button>
      <button (click)="next()" [disabled]="vm.nextDisabled">
          Next
      </button>
      <button (click)="goToEnd()" [disabled]="vm.nextDisabled">
          End
      </button>
      <button (click)="toggleShowItemsPerPage()">Show</button>
      <select
              (input)="itemsPerPageChanged($event)"
              *ngIf="vm.showItemsPerPage">
          <option
                  *ngFor="let option of vm.itemsPerPageOptions"
                  [value]="option"
          >{{option}}</option>
      </select>
  `,
})
export class PagerUiComponent extends SignalState<PagerState> {
  @Input()
  public set itemsPerPage(v: number) {
    this.patch({ itemsPerPage: v })
  }

  @Input()
  public set total(v: number) {
    this.patch({ total: v })
  }

  @Input()
  public set pageIndex(v: number) {
    this.patch({ pageIndex: v })
  };

  @Output() public readonly pageIndexChange = new EventEmitter<number>();
  @Output() public readonly itemsPerPageChange = new EventEmitter<number>();

  constructor() {
    super();
    this.initialize({
      itemsPerPage: 0,
      total: 0,
      pageIndex: 0,
      showItemsPerPage: false,
      itemsPerPageOptions: [5, 10, 20]
    });
  }

  private readonly viewModel: Signal<ViewModel> = computed(() => {
    const { total, pageIndex, itemsPerPage, showItemsPerPage, itemsPerPageOptions } = this.state();
    return {
      total,
      previousDisabled: pageIndex === 0,
      nextDisabled: pageIndex >= Math.ceil(total / itemsPerPage) - 1,
      itemFrom: pageIndex * itemsPerPage + 1,
      showItemsPerPage,
      itemsPerPageOptions,
      itemTo:
        pageIndex < Math.ceil(total / itemsPerPage) - 1
          ? pageIndex * itemsPerPage + itemsPerPage
          : total,
    }
  })

  public get vm(): ViewModel {
    return this.viewModel();
  }

  public toggleShowItemsPerPage(): void {
    this.patch({ showItemsPerPage: !this.snapshot.showItemsPerPage });
  }

  public goToStart(): void {
    this.pageIndexChange.emit(0);
  }

  public next(): void {
    this.pageIndexChange.emit(this.snapshot.pageIndex + 1);
  }

  public previous(): void {
    this.pageIndexChange.emit(this.snapshot.pageIndex - 1);
  }

  public goToEnd(): void {
    this.pageIndexChange.emit(Math.ceil(this.total / this.itemsPerPage) - 1);
  }

  public itemsPerPageChanged(option: any): void {
    this.itemsPerPageChange.emit(+option?.target?.value)
  }
}

@Component({
  selector: 'app-pager',
  standalone: true,
  imports: [CommonModule, PagerUiComponent],
  template: `
    <h1>Pager example</h1>
    <p>This page show how to deal with local component state for a dumb component and a simple smart component</p>
    <si-pager
      [pageIndex]="state().pageIndex"
      [itemsPerPage]="state().itemsPerPage"
      [total]="state().total"
      (pageIndexChange)="patch({pageIndex:$event})"
      (itemsPerPageChange)="patch({itemsPerPage: $event})"
    ></si-pager>
  `,
  styleUrls: ['./pager.component.scss']
})
export class PagerComponent extends SignalState<{pageIndex: number; itemsPerPage: number; total: number}>{
  constructor() {
    super();
    this.initialize({
      pageIndex: 0,
      itemsPerPage: 5,
      total: 100
    })
  }
}
