/**
 * Raw input from the API request — the single event the whole game loop
 * reacts to.
 */
export interface DeliveryEvent {
    deliveryCompleted: boolean;
    onTime: boolean;
    rating?: number;
}
