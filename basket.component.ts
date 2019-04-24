import { Component, OnInit,OnDestroy } from '@angular/core';
import { Cart } from 'app/viewModels/cart';
import {CartService } from '../cart.service';
import { ProductsService } from '../products.service';
import { PurchaseService} from '../purchase.service'
import { Subscription } from 'rxjs';
import { Product } from 'app/viewModels/product';
import * as firebase from 'firebase';
import Swal from 'sweetalert2';
import { AppService } from 'app/app.service';

@Component({
  selector: 'app-basket',
  templateUrl: './basket.component.html',
  styleUrls: ['./basket.component.scss']
})
export class BasketComponent implements OnInit, OnDestroy {
  id;
 d:any = new Date();
j=0;
color;
test=false;
size;
  delete = false;
  totals ;
  i:any = 0;
  done= false;
  cart: Cart ;
  products: Product [] = [];
  product: Product;
  private productsSub: Subscription;
  private cartsSub: Subscription;


  constructor(
    private appService:AppService,
    private cartService: CartService,
     private productsService: ProductsService,
     private purchaseService: PurchaseService,
    ) { }

  ngOnInit() {
    this.productsService.getProducts();
    this.productsSub = this.productsService.getProductUpdateListener()
    .subscribe(() => {
      this.getProduct();
    });
    
    this.cartService.getcarts();
    this.cartsSub = this.cartService.getcartUpdateListener()
    .subscribe(() => {
      this.cart = this.cartService.getCart( this.appService.id);

      if(this.appService.product.length !== 0 && this.appService.id !== undefined && this.j !==2 ){
        console.log('ok');
        this.j+=1;
        for(let i = 0; i < this.appService.product.length ; i++) {
          this.cartService.updateCart(this.cart.id, this.appService.product[i], this.appService.id, 3000);
          this.cartService.getcarts();
    this.cartsSub = this.cartService.getcartUpdateListener()
    .subscribe(() => {
      this.cart = this.cartService.getCart( this.appService.id);});
          this.done=true;
         
        }
      } else{this.done = true;}
    });
    
   
    
 
  
    }
// tslint:disable-next-line: one-line
less(Pid) {
  for (let i = 0; i < this.products.length; i++) {
    if (this.products[i].id === Pid) {
      if(this.products[i].Qte > 1) {
        this.products[i].Qte -= 1;
      }else {
        this.cartService.deleteItem(this.cart.id, Pid, this.id, 3000);
        this.products = this.products.filter(p => p.id !== Pid);
        this.delete = true;
      }
    }
  }
  this.total();
}
add(Pid) {
  for (let i = 0; i < this.products.length; i++) {
    if (this.products[i].id === Pid) {
   this.products[i].Qte += 1;
   this.total();
    }
  }
 
}

getProduct(){
  if(this.appService.id !== undefined ){
    if(this.done === true && this.products.length <= this.cart.Pid.length - 1 && this.delete === false) {
      console.log('ok');
      this.product = this.productsService.getProduct( this.cart.Pid[this.i]);
      this.product.Qte = 1;
      this.i += 1;
      console.log(this.cart.Pid.length);
      console.log(this.i);
      console.log(this.products);
      console.log(this.products.length);
      if(this.product !== undefined && this.products.indexOf(this.product) === -1) {
        this.products.push(this.product);
     }
     this.total();
    }
  }else{
    if(this.done === true
      && this.products.length <= this.appService.product.length - 1 
      && this.delete === false
      && this.appService.product.length !== 0) {
    this.product = this.productsService.getProduct(this.appService.product[this.i]);
    this.product.Qte = 1;
    this.i += 1;
    if(this.product !== undefined && this.products.indexOf(this.product) === -1) {
      this.products.push(this.product);
   }
   this.total();
  }
  }

}
deleteItem(Pid: string){

  Swal.fire({
    title: "Are you sure ?",
    text: "you will delete this item " ,
    type:"warning",
    showCancelButton : true,
    confirmButtonText : 'Yes',
    cancelButtonText : 'No, keep it'
  })   .then(
    (result)=>{
      if(this.appService.id !== undefined){
 if(result.value){
        const Pid2 = Pid;
        this.cartService.deleteItem(this.cart.id, Pid, this.id, 3000);
        this.products = this.products.filter(p => p.id !== Pid2 );
        this.delete = true;
       
        Swal.fire('deleted',  '' ,  'success',
      )}
      
     else if(result.dismiss=== Swal.DismissReason.cancel){
        Swal.fire('Cancel','','error');
      }}else{
        this.appService.product = this.appService.product.filter(p => p !== Pid);
        this.products = this.products.filter(p=> p.id !== Pid);
      }
    }
  );

}
deleteAll(Pid: Array<string>) {

  Swal.fire({
    title: "Are you sure ?",
    text: "you will delete all items " ,
    type:"warning",
    showCancelButton : true,
    confirmButtonText : 'Yes',
    cancelButtonText : 'No, keep it'
  })   .then(
    (result)=>{
      if(result.value){
        this.cartService.deleteall(this.cart.id, Pid, this.id, 3000);
        this.products=[];
        this.appService.product = [];
        this.delete= true;
        Swal.fire('deleted',  '' ,  'success')}
      else if(result.dismiss=== Swal.DismissReason.cancel){
        Swal.fire('Cancel','','error');
      }
    }
  );
}
addPurchase() {
  for( let i=0;i<this.products.length;i++){
 if( this.products[i].color2 === undefined ||  this.products[i].size2 === undefined){
  Swal.fire({
    title: "something went wrong ",
    text: 'select color and size for all products ! ' ,
    type:"error",
});
this.test=true;
 }}

if(this.test === false){
  Swal.fire({
    title: 'Are you sure ?',
    text: 'you will purchase '+ this.products.length + ' ' + 'product(s)',
    type:'warning',
    showCancelButton : true,
    confirmButtonText : 'Yes',
    cancelButtonText : 'No !'
  }) .then((result) =>{
    if(result.value){
      for( let i=0;i<this.products.length;i++){

    this.purchaseService.addPurchase( firebase.auth().currentUser.uid, 
                                      this.products[i].id ,
                                      this.products[i].Qte, this.products[i].price, 
                                      this.products[i].price * this.products[i].Qte, this.d,
                                      this.products[i].color2,
                                      this.products[i].size2);
                                  
  }
  Swal.fire('Done',  '' ,  'success') }})

} this.test = false;
}
total() {
  this.totals = 0;
  console.log(this.products);
  for (let i = 0; i < this.products.length; i++) {
console.log(this.products.length);
this.totals += this.products[i].Qte * this.products[i].price;
console.log(this.totals);
  }
}
coloring(Pid,color){
  for (let i = 0; i < this.products.length; i++){
    if (this.products[i].id === Pid){
this.products[i].color2 = color;
    }
  }
}
sizing(Pid,size){
  for (let i = 0; i < this.products.length; i++){
    if (this.products[i].id === Pid){
this.products[i].size2 = size;
    }
  }
}
ngOnDestroy() {
  this.productsSub.unsubscribe();
  this.cartsSub.unsubscribe();
}
  }

