import { useEffect, useRef, useState } from "react"
import API, { endpoints } from "../API";

export default function Paypal(props) {
    const paypal = useRef();
    const service = props.service;
    const currentUser = props.currentUser;
    const doctor = props.doctor;
    const shift = props.shift;
    const booking = props.booking;
    const handleSubmit = props.handleSubmit;

    useEffect(() => {

        window.paypal.Buttons({
            createOrder: (data, actions, err) => {
                return actions.order.create({
                    intent: 'CAPTURE',
                    purchase_units: [
                        {
                            description: service?.name,
                            amount: {
                                current_code: 'CAD',
                                value: service?.price
                            }
                        }
                    ]
                })
            },
            onApprove: async (data, actions) => {
                const order = await actions.order.capture();
                
                await handleSubmit();
            },
            onError: (err) => {
                console.log(err)
            },
        }).render(paypal.current)
    }, [props.service, props.currentUser])

    return (
        <div>
            <div ref={paypal}></div>
        </div>
    )
}