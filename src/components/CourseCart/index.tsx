import { useState } from "react"

type Course = {
    id:string,
    title: string,
    price: number
}

type CartItem = {
    course: Course,
    quantity: number
}

const courses: Course[] = [
  { id:"1", title: "React Fundamentals", price: 1000 },
  { id: "2", title: "TypeScript Masterclass", price: 1500 },
  { id: "3", title: "API Development", price: 2000 },
];

type CouponCode = "SAVE20%" | "" ;

function calculateDiscount(subTotal:number, coupon: CouponCode): number{
        if(coupon === "SAVE20%"){
            return subTotal * 0.2;
        }
        if(subTotal >= 3000){
            return subTotal * 0.1;
        }
        return 0;
   }

   // calculate subtotal
function calculateSubtotal(cart:CartItem[]):number {
    const subTotal = cart.reduce((total,item)=> 
        total + item.course.price * item.quantity,0
    );
    return subTotal
}

// calculate Tax on the amout after deducting discount if applicable

function calculateTaxAmt(amountAfterDiscount: number){
    return amountAfterDiscount * 0.18
}

export default function CourseCart(){

    const [cart, setCart] = useState<CartItem[]>([]);
    const [coupon, setCoupon] = useState<CouponCode>("");

    const addToCart=(course: Course)=> {
        setCart((previousCart):any => {
            const existingItem = previousCart.find((item:any)=> item.course.id === course.id);
            if(existingItem){
                return previousCart.map((item:any)=> item.course.id === course.id
                ? {...item, quantity: item.quantity + 1} 
                : item )
            }
           return [...previousCart,{course, quantity:1}]
        })

    }

    const updateQuantity = (courseId:string, change: number)=> {

       setCart((previousCart)=> 
        previousCart.map((item)=> 
            item.course.id === courseId ?
             { ...item, quantity: Math.max(1, item.quantity + change),

             } : item
        )
    )
    }

   const removeFromCart = (courseId: string)=>{
        setCart((previousCart)=> 
            previousCart.filter((item)=> item.course.id !== courseId)
        )
   }

  const subtotal = calculateSubtotal(cart);
  const discount = calculateDiscount(subtotal, coupon);
  const discountedSubtotal = subtotal - discount;
  const tax = calculateTaxAmt(discountedSubtotal);
  const finalTotal = discountedSubtotal + tax;
  console.log("subtotal ::",subtotal, "discount ::",discount, "discountedSubTotal ::",discountedSubtotal,
    "tax ::", tax, "finalTotal ::",finalTotal);

    return(
        <div>
            <h2>Courses </h2>
            {
                courses.map((course)=> {
                    
                    return(
                        <div key={course.id}>
                           <p>Title : {course.title}</p>
                           <p>Price : {course.price}</p>
                           <button type="button" onClick={()=>addToCart(course)}>Add to cart</button>
                        </div>
                    )
                })
            }
           <hr />
           {
              cart.length === 0 ? (<p>Cart is Empty</p>)
                                : cart.map((item)=> {
                                    return(
                                        <div key={item.course.id}>
                                            <h3>{item.course.title}</h3>
                                            <p>{item.course.price} X {item.quantity}
                                                = {item.course.price * item.quantity}
                                            </p>
                                            <button onClick={()=> updateQuantity(item.course.id, -1)}
                                               disabled = {item.quantity ===1} >
                                                --</button>
                                            <button onClick={()=> updateQuantity(item.course.id,1)}>
                                                +
                                            </button>
                                            <button onClick={()=> removeFromCart(item.course.id)}>
                                                    remove
                                            </button>
                                        </div>
                                    )
                                })
           }

           <hr />
           <div>
                <h4>Apply Coupon</h4>
                <select onChange={(event)=> setCoupon(event.target.value as CouponCode)}>
                    <option value="no coupon">No Coupon</option>
                    <option value="SAVE20%">Save 20% of your actual money</option>
                </select>
           </div>
           <hr />
        {
            cart.length && (
                <>
                <h2>Bill Summary</h2>
                  <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
                  <p>Discount: -₹{discount.toFixed(2)}</p>
                  <p>Tax (18%): ₹{tax.toFixed(2)}</p>
                  <h3>Final Total: ₹{finalTotal.toFixed(2)}</h3>
                </>
        )}
        </div>
    )
}