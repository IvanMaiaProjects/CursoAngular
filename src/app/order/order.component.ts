import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { RadioOption } from '../shared/radio/radio-option.model';
import { OrderService } from './order.service';
import { Order, OrderItem } from './order.model';
import { CartItem } from '../restaurant-detail/shopping-cart/cart-item.model';
import { Router } from '@angular/router';


@Component({
  selector: 'mt-order',
  templateUrl: './order.component.html'
})
export class OrderComponent implements OnInit {

  private static emailPattern =
    /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

  private static numberPattern = /^([0-9]*|(['S']['\/']['N'])|(['s']['\/']['n']))$/;

  orderForm: FormGroup;

  paymentOptions: RadioOption[] = [
    {label: 'Dinheiro', value: 'MON'},
    {label: 'Cartão de débito', value: 'DEB'},
    {label: 'Cartão refeição', value: 'REF'}
  ];

  delivery: number = 8;

  private static equalsTo (group: AbstractControl): {[key: string]: boolean} {
    const email = group.get('email');
    const emailConfirmation = group.get('emailConfirmation');

    if (!email || !emailConfirmation) {
      return undefined;
    }

    if (email.value !== emailConfirmation.value) {
      return {emailsNotMatch: true};
    }

    return undefined;
  }

  constructor(private orderService: OrderService,
              private router: Router,
              private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.orderForm = this.formBuilder.group({
      name: this.formBuilder.control('', [Validators.required, Validators.minLength(5)]),
      email: this.formBuilder.control('', [Validators.required, Validators.pattern(OrderComponent.emailPattern)]),
      emailConfirmation: this.formBuilder.control('', [Validators.required, Validators.pattern(OrderComponent.emailPattern)]),
      address: this.formBuilder.control('', [Validators.required, Validators.minLength(5)]),
      number: this.formBuilder.control('', [Validators.required, Validators.pattern(OrderComponent.numberPattern)]), 
      optionalAddress: this.formBuilder.control(''),
      paymentOption: this.formBuilder.control('', [Validators.required])
    }, {validator: OrderComponent.equalsTo});
  }

  itemsValue(): number{
        return this.orderService.itemsValue();
  }

  cartItems() {
    return this.orderService.cartItems();
  }

  increaseQty(cartItem: CartItem) {
    this.orderService.increaseQty(cartItem)
  }

  decreaseQty(cartItem: CartItem){ 
    this.orderService.decreaseQty(cartItem)
  }

  remove(cartItem: CartItem) {
    this.orderService.remove(cartItem);
  }

  checkOrder(order: Order){

    order.orderItems = this.cartItems()
      .map((item: CartItem) => new OrderItem(item.quantity, item.menuItem.id));

    this.orderService.checkOrder(order)
      .subscribe( (orderId: string) => {
        console.log(`Compra concluída: ${orderId}`);
        this.orderService.clear();
        this.router.navigate(['/order-summary']);
      });

    console.log(order);
  }

}
